/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import mongoose, {FilterQuery, PaginateModel, QueryOptions} from "mongoose";
import {IMessage} from "./entities/message.entity";
import {GroupMessageStatusService} from "../group_message_status/group_message_status.service";
import {FileUploaderService} from "../../common/file_uploader/file_uploader.service";
import {SendMessageDto} from "../channel/dto/send.message.dto";
import {MessagesSearchDto} from "./dto/messages_search_dto";
import {IUser} from "../../api/user_modules/user/entities/user.entity";
import {newMongoObjId} from "../../core/utils/utils";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel("message") private readonly messageModel: PaginateModel<IMessage>,
        private readonly groupMessageStatusService: GroupMessageStatusService,
        private readonly s3: FileUploaderService
    ) {

    }

    async getByIdOrFail(messageId: any, select?: string) {
        let msg = await this.messageModel.findById(messageId, select).lean();
        if (!msg) {
            throw new NotFoundException("message not found " + messageId);
        }
        return msg;
    }

    async findOne(filter: FilterQuery<IMessage>) {
        let m = await this.messageModel.findOne(filter);
        return this.prepareTheMessageModel(m)

    }

    async create(dto: SendMessageDto, session?) {
        let x = await this.messageModel.create([dto.toJson()], {session});
        return this.prepareTheMessageModel(x[0])
    }

    async createOneFromJson(dto: {}) {
        return this.messageModel.create(dto);
    }

    async createMany(data: SendMessageDto[], session?) {
        return this.messageModel.create(data.map(value => value.toJson()), {session});
    }

    // async insertMany(data: any[], session?) {
    //     return this.messageModel.insertMany(data, {session});
    // }
    //
    // async findAllMessages(myId: string, roomId: string, dto: MessagesSearchDto) {
    //     let res: IMessage[] = await this.messageModel.find(null, "+stars", {lean: true}).sort(dto.isAsc == "true" ? "_id" : "-_id").where({
    //         rId: roomId,
    //         dF: {$ne: myId},
    //         ...dto.getFilter()
    //     }).limit(dto.getLimit());
    //     for (let msg of res) {
    //         // msg = await this.s3.getSignedMessage(msg);
    //         msg['isStared'] = msg.stars.find(value => value.toString() == myId) != null
    //         if (msg['oneSeenBy']) {
    //             let x = msg['oneSeenBy']
    //             let index = x.findIndex(value => value.toString() == myId)
    //             msg['isOneSeenByMe'] = index != -1
    //             delete msg['oneSeenBy']
    //         } else {
    //             msg['isOneSeenByMe'] = false;
    //         }
    //     }
    //     return res
    // }

    async findAllMessagesAggregation(myId:any, roomId:any,  dto: MessagesSearchDto) {

        let sortDirection = dto.isAsc === "true" ? 1 : -1;
        let limit =parseInt(dto.getLimit().toString(),10) ;

        let pipeline:any[] = [
            {
                $match: {
                    rId: roomId,
                    dF: {$ne: myId},
                    ...dto.getFilter()
                }
            },
            {
                $sort: {
                    _id: sortDirection
                }
            },
            {
                $limit: limit
            },
            {
                $addFields: {
                    isStared: {
                        $in: [myId, {$ifNull: ['$stars', []]}]
                    },
                    isOneSeenByMe: {
                        $in: [myId, {$ifNull: ['$oneSeenBy', []]}]
                    }  ,
                    isDeletedFromMe: {
                        $in: [myId, {$ifNull: ['$dF', []]}]
                    }
                }
            },
            {
                $unset: ['oneSeenBy','dF','stars','mentions']
            }
        ];
        return this.messageModel.aggregate(pipeline).exec();
    }

    async paginated(dto: any[]) {
        return this.messageModel.paginate(...dto);

    }

    async findAll(filter: FilterQuery<IMessage>, options?: QueryOptions<IMessage>) {
        return this.messageModel.find(filter, null, options)
    }

    private prepareTheMessageModel(msg: IMessage) {
        if (!msg) {
            return null
        }
        msg['isStared'] = false;
        return msg;
    }

    async getUnReadCount(lastMessageSeenId: string, roomId: string, myId: any) {
        return this.messageModel.countDocuments({
            $and: [
                {_id: {$gt: lastMessageSeenId}},
                {rId: roomId},
                {sId: {$ne: myId}}
            ]
        }).lean();
    }


    async setMessageSeenForSingleChat(userId: string, roomId: string): Promise<any> {
        const roomObjectId = new mongoose.Types.ObjectId(roomId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        return this.messageModel.updateMany({
            rId: roomObjectId,
            sId: {$ne: userObjectId},
            sAt: null
        }, {
            $set: {sAt: new Date()}
        });
    }

    async setMessageSeenForGroupChat(userId: string, roomId: string) {
        await this.setMessageDeliverForGroupChat(userId, roomId);
        return this.groupMessageStatusService.updateMany({
            rId: roomId,
            uId: userId,
            sAt: null
        }, {
            sAt: new Date()
        })
    }

    async setMessageDeliverForSingleChat(userId: string, roomId: any): Promise<any> {
        const roomObjectId = new mongoose.Types.ObjectId(roomId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        return this.messageModel.updateMany({
            rId: roomObjectId,
            sId: {$ne: userObjectId},
            dAt: null

        }, {
            dAt: new Date()
        });
    }

    async setMessageDeliverForGroupChat(myId: string, roomId: string): Promise<boolean> {
        return await this.groupMessageStatusService.updateMany({
            rId: roomId,
            uId: myId,
            dAt: null
        }, {
            dAt: new Date()
        });
    }

    async deleteMessageFromMe(myId: any, id: string) {
        await this.getByIdOrFail(id);
        return this.messageModel.findByIdAndUpdate(id, {
            $addToSet: {
                dF: myId
            }
        }, {new: true});

    }

    async isMeMessageSenderOrThrow(myId: any, id: string) {
        let msg = await this.getByIdOrFail(id,);
        if (msg.sId != myId) throw new ForbiddenException("you dont have access")
        return msg
    }

    async deleteAllRoomMessagesFromMe(userId, roomId: string) {
        await this.messageModel.updateMany({
            rId: roomId
        }, {
            $addToSet: {
                dF: userId
            }
        });
    }

    async deleteAll() {
        await this.messageModel.deleteMany();
    }

    async deleteOne(filter: FilterQuery<IMessage>,) {
        await this.messageModel.deleteOne(filter);
    }

    async deleteWhere(filter: FilterQuery<IMessage>,) {
        await this.messageModel.deleteMany(filter);
    }

    async isMessageExist(localId: string) {
        return this.messageModel.findOne({lId: localId});
    }

    async findByRoomIdAndUpdate(rId: string, param2: {}): Promise<any> {
        return this.messageModel.updateMany({
            rId: rId
        }, param2);
    }

    async findByIdAndUpdate(mId: string, update: {}) {
        return this.messageModel.findByIdAndUpdate(mId, update, {new: true});
    }

    async findById(mId: string) {
        return this.messageModel.findById(mId,);
    }

    async findWhere(filter: {}, select?: string, options?: QueryOptions<IMessage>) {
        return this.messageModel.find(filter, select, options);
    }

    async getById(id: string, select?: string) {
        return this.messageModel.findById(id, select).lean();
    }

    updateMany(filter: FilterQuery<IMessage>, update, options?: QueryOptions<IMessage> | null | undefined): Promise<any> {
        return Promise.resolve(this.messageModel.updateMany(filter, update, options));
    }

    async findCount(filter?: FilterQuery<IMessage>, options?: QueryOptions<IMessage>) {
        return this.messageModel.countDocuments(filter, options).lean();
    }

    async getByLocalId(lId: string, select?: string): Promise<IMessage | null> {
        return this.messageModel.findOne({lId: lId}, select).lean();
    }
}