/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable,} from '@nestjs/common';

import {ConfigService} from '@nestjs/config';
import {  OneFullRoomModel} from "../chat.helper";

import * as mongoose from "mongoose";
import {PaginationParameters} from "mongoose-paginate-v2";
import {remove} from "remove-accents";
import {RoomMemberService} from "../../room_member/room_member.service";
import {MessageService} from "../../message/message.service";
import {UserService} from "../../../api/user_modules/user/user.service";
import {UserBanService} from "../../../api/user_modules/user_ban/user_ban.service";
import {SingleRoomSettingsService} from "../../single_room_settings/single_room_settings.service";
import {OrderRoomSettingsService} from "../../order_room_settings/single_room_settings.service";
import {GroupSettingsService} from "../../group_settings/group_settings.service";
import {BroadcastSettingsService} from "../../broadcast_settings/broadcast_settings.service";
import {GroupMemberService} from "../../group_member/group_member.service";
import {BroadcastMemberService} from "../../broadcast_member/broadcast_member.service";
import {SocketIoService} from "../../socket_io/socket_io.service";
import {RoomMiddlewareService} from "../../room_middleware/room_middleware.service";
import {FileUploaderService} from "../../../common/file_uploader/file_uploader.service";
import {newMongoObjId} from "../../../core/utils/utils";
import {ISingleRoomSettings} from "../../single_room_settings/entities/single_room_setting.entity";
import {IUser} from "../../../api/user_modules/user/entities/user.entity";
import {RoomType, SocketEventsType} from "../../../core/utils/enums";
import {MongoPeerIdDto} from "../../../core/common/dto/mongo.peer.id.dto";
import {CreateOrderRoomDto} from "../../../core/common/dto/mongo.peer.id.order.id.dto";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {IRoomMember} from "../../room_member/entities/room_member.entity";
import {getLinkPreview} from "link-preview-js";

@Injectable()
export class ChannelService {
    constructor(
        private readonly roomMemberService: RoomMemberService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly singleRoomSetting: SingleRoomSettingsService,
        private readonly orderRoomSetting: OrderRoomSettingsService,
        private readonly socket: SocketIoService,
        private readonly middlewareService: RoomMiddlewareService,
        private readonly userBan: UserBanService,
    ) {
    }

    async _getOneFullRoomModel(dto: OneFullRoomModel) {
        let f = {
            rId: newMongoObjId(dto.roomId),
            uId: newMongoObjId(dto.userId),
            isD: false,
            ...dto.filter
        }
        if (dto.deleteIsDKey) {
            delete f.isD
        }
        let x = await this.roomMemberService
            .aggregate(this.getChannelStagesV3({
                page: 0,
                limit: 1,
                myIdObj: newMongoObjId(dto.userId),
                filter: f
            }))
        let room = x[0];
        if (!room) throw new BadRequestException("getOneFullRoomModel while aggregate cant find room" + dto.roomId + " to user" + dto.userId)
        return room;
    }

    async getOrCreatePeerRoom(dto: MongoPeerIdDto, session?: mongoose.ClientSession) {
        let peerUser: IUser = await this.userService.findByIdOrThrow(dto.peerId, "userImage fullName fullNameEn")
        dto.peerId = peerUser._id
        let sRS: ISingleRoomSettings = await this.middlewareService.getSingleRoomSetting(dto.peerId, dto.myUser._id);
        if (sRS) {
            /// there are old room between
            return await this._getOneFullRoomModel({
                roomId: sRS._id,
                userId: dto.myUser._id,
                deleteIsDKey: true
            });
        }
        if (dto.peerId == dto.myUser._id) {
            throw new BadRequestException('Cant start chat with your self!');
        }

        let roomSettingId = newMongoObjId().toString();
        /// Create the single room setting
        await this.singleRoomSetting.create({
            _id: roomSettingId.toString(),
            cId: dto.myUser._id,
            pId: dto.peerId,
        }, session)
        /// create 2 room members
        await this.roomMemberService.createMany([
            {
                uId: dto.myUser._id,
                rId: roomSettingId,
                lSMId: roomSettingId,
                rT: RoomType.Single,
                t: peerUser.fullName,
                tEn: peerUser.fullNameEn,
                img: peerUser.userImage,
                pId: dto.peerId,
                isD: true,
            },
            {
                uId: peerUser._id,
                rId: roomSettingId,
                lSMId: roomSettingId,
                rT: RoomType.Single,
                t: dto.myUser.fullName,
                tEn: dto.myUser.fullNameEn,
                img: dto.myUser.userImage,
                pId: dto.myUser._id,
                isD: true,
            },

        ], session)
        await this.socket.joinRoom({
            usersIds: [dto.peerId.toString(), dto.myUser._id.toString()],
            roomId: roomSettingId,
        });
        // await session.commitTransaction();
        return this._getOneFullRoomModel({
            roomId: roomSettingId,
            userId: dto.myUser._id,
            deleteIsDKey: true
        });
    }

    async createOrderRoom(dto: CreateOrderRoomDto) {
        let peerUser: IUser = await this.userService.findByIdOrThrow(dto.peerId, "userImage fullName fullNameEn")
        if (dto.peerId == dto.myUser._id) {
            throw new BadRequestException('Cant start chat with your self!');
        }
        let oldRoomSettings = await this.orderRoomSetting.findOne({
            orderId: dto.orderId
        })
        if (oldRoomSettings) {
            let res = await this.middlewareService.isThereRoomMember(oldRoomSettings._id, dto.myUser._id,)
            if (!res) throw new BadRequestException("You are try to create a room for order id that already has room between another users orderId must be unique for your order!")
            let data = await this._getOneFullRoomModel({
                roomId: oldRoomSettings._id,
                userId: dto.myUser._id,
                deleteIsDKey: true
            });
            if (dto.orderData) {
                await this.orderRoomSetting.findOneAndUpdate({
                    orderId: dto.orderId
                }, {
                    pinData: dto.orderData
                })
            }
            return data
        }
        let roomSettingId = newMongoObjId().toString();
        await this.orderRoomSetting.create({
            _id: roomSettingId.toString(),
            cId: dto.myUser._id,
            pId: dto.peerId,
            orderTitle: dto.orderTitle,
            orderImage: dto.orderImage,
            orderId: dto.orderId,
            pinData: dto.orderData
        })
        await this.roomMemberService.createMany([
            {
                uId: dto.myUser._id,
                rId: roomSettingId,
                lSMId: roomSettingId,
                rT: RoomType.Order,
                t: dto.orderTitle ?? peerUser.fullName,
                tEn: dto.orderTitle ?? remove(peerUser.fullNameEn),
                img: dto.orderImage ?? peerUser.userImage,
                pId: dto.peerId,
                isD: true,
                orderId: dto.orderId,
            },
            {
                uId: peerUser._id,
                rId: roomSettingId,
                lSMId: roomSettingId,
                rT: RoomType.Order,
                t: dto.orderTitle ?? dto.myUser.fullName,
                tEn: dto.orderTitle ?? remove(dto.myUser.fullNameEn),
                img: dto.orderImage ?? dto.myUser.userImage,
                pId: dto.myUser._id,
                orderId: dto.orderId,
                isD: true,
            },

        ])
        await this.socket.joinRoom({
            usersIds: [dto.peerId.toString(), dto.myUser._id.toString()],
            roomId: roomSettingId,
        });
        // await session.commitTransaction();
        return this._getOneFullRoomModel({
            roomId: roomSettingId,
            userId: dto.myUser._id,
            deleteIsDKey: true
        });
    }

    async updateRoomTranslate(dto: MongoRoomIdDto, transTo: string) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        return this.roomMemberService.findOneAndUpdate({
                uId: dto.myUser._id,
                rId: dto.roomId,
            },
            {tTo: transTo,},
            null,
            {new: true}
        );
    }

    async stopRoomTranslate(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        return this.roomMemberService.findOneAndUpdate({
            uId: dto.myUser._id,
            rId: dto.roomId,
        }, {tTo: null,}, null, {new: true});
    }

    async getRoomsLimited(dto: Object, userId: string) {
        let paginationParameters = new PaginationParameters(
            {
                query: {
                    limit: 20,
                    page: 1,
                    sort: "-_id",
                    ...dto,
                },
            }
        ).get()
        if (paginationParameters[1].page <= 0) {
            paginationParameters[1].page = 1
        }
        if (paginationParameters[1].limit <= 0 || paginationParameters[1].limit >= 50) {
            paginationParameters[1].limit = 20
        }
        let filter = {
            uId: newMongoObjId(userId),
            isD: false,
            isA: false,
        }
        if (dto['roomType']) {
            filter['rT'] = dto['roomType']
        }
        if (dto['mutedOnly'] == "true") {
            filter['isM'] = true
        }
        if (dto['archiveOnly'] == "true") {
            filter['isA'] = true
        }
        if (dto['deletedOnly'] == "true") {
            filter['isD'] = true
        }
        if (dto['title']) {
            let x = remove(dto['title'])
            filter['$or'] = [
                {
                    tEn: {
                        "$regex": ".*" + x + ".*",
                        "$options": "i"
                    }
                },
                {
                    nTitle: {
                        "$regex": ".*" + x + ".*",
                        "$options": "i"
                    }
                }

            ]
        }
        let stages = this.getChannelStagesV3({
            page: paginationParameters[1].page,
            limit: paginationParameters[1].limit,
            myIdObj: newMongoObjId(userId),
            filter: filter
        })
        return await this.roomMemberService.aggregateV2(stages, paginationParameters[1].page, paginationParameters[1].limit,)
    }

    //invoked only if room not exist in the peer he will request it
    async getRoomById(dto: MongoRoomIdDto) {
        //check if the user has already accessed to this room
        let rMember: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        if (rMember.rT == RoomType.Single) {
            let rS = await this.singleRoomSetting.findByIdOrThrow(dto.roomId)
            let ban = await this.userBan.getBan(rS.pId, rS.cId);
            if (ban) throw new BadRequestException("There are ban you dont have access!")
        }
        let rMessage = await this.messageService.findOne({
            rId: rMember.rId,
            dF: {$ne: dto.myUser._id},
        })
        if (!rMessage) {
            throw new BadRequestException("WORKING You are try to get room but i dont have messages yet !")
            // console.log("WORKING You are try to get room but i dont have messages yet !")
        }
        if (rMember.isD) {
            //un delete the room
            await this.middlewareService.unDeleteAllRoomMembers(rMember.rId)
            await this.socket.joinRoom({roomId: rMember.rId.toString(), usersIds: [dto.myUser._id.toString()]})
        }
        return this._getOneFullRoomModel({
            roomId: dto.roomId,
            userId: dto.myUser._id
        })
    }

    async deliverRoomMessages(dto: MongoRoomIdDto) {
        let rMember: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        if (rMember.rT == RoomType.Single || rMember.rT == RoomType.Order) {
            let res = await this.messageService.setMessageDeliverForSingleChat(
                dto.myUser._id,
                dto.roomId,
            );
            let isUpdated = res['modifiedCount'] != 0;
            if (isUpdated) {
                this.socket.io.to(dto.roomId.toString()).emit(
                    SocketEventsType.v1OnDeliverChatRoom,
                    JSON.stringify({
                        roomId: dto.roomId.toString(),
                        //it right because i need to notify the other person i chat with him no me!
                        userId: rMember.pId.toString(),
                        date: new Date(),
                    }),
                );
            }
            return {
                isUpdated: isUpdated,
            };
        }
        if (rMember.rT == RoomType.GroupChat) {
            let res = await this.messageService.setMessageDeliverForGroupChat(
                dto.myUser._id,
                dto.roomId,
            );
            return {
                isUpdated: res,
            };
        }
        return {
            isUpdated: false,
        };
    }

    async changeNickName(dto: MongoRoomIdDto, name?: string) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (!name || name == "") {

            await this.roomMemberService.findByIdAndUpdate(rM._id, {
                nTitle: null
            })
            return "success"
        }
        let res = await this.roomMemberService.findByIdAndUpdate(rM._id, {
            nTitle: name
        })
        return "success"
    }

    async muteRoomNotification(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isM: true,});
        return "Room muted"
    }

    async unMuteRoomNotification(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isM: false,});
        return "Room un muted"
    }

    async deleteRoom(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {
            isD: true,
        });
        await this.messageService.findByRoomIdAndUpdate(dto.roomId, {
            $addToSet: {
                dF: dto.myUser._id,
            },
        });
        return 'Room has been deleted';
    }

    async getMySingleChatInfo(dto: MongoRoomIdDto) {
        let rM: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Single) {
            throw new BadRequestException("room must be single chat to continue you send " + rM.rT)
        }
        let res = {
            banned: false,
            bannerId: null
        }
        let ban = await this.userBan.getBan(dto.myUser._id, rM.pId)
        if (ban) {
            res['banned'] = true
            res['bannerId'] = dto.myUser._id
        }
        res['lastSeenAt'] = (await this.userService.findById(rM.pId, "lastSeenAt")).lastSeenAt
        return res
    }

    async getMyOrderChatInfo(dto: MongoRoomIdDto) {
        let rM: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Order) {
            throw new BadRequestException("room must be order chat to continue you send " + rM.rT)
        }
        let res = {}
        let settings = await this.orderRoomSetting.findOne({_id: dto.roomId})
        res['lastSeenAt'] = (await this.userService.findById(rM.pId, "lastSeenAt")).lastSeenAt
        res['orderSettings'] = settings
        return res
    }


    async getRoomUnReadCount(dto: MongoRoomIdDto) {
        let rMember: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        return this.messageService.getUnReadCount(
            rMember.lSMId,
            rMember.rId,
            dto.myUser._id,
        );
    }

    async archiveRoom(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isA: true,});
        return "Room  archived"
    }

    async unArchiveRoom(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isA: false,});
        return "Room un archived"
    }

    async getStarMessages(dto: Object, myId: string) {
        let messages = await this.messageService.findAll({
            stars: newMongoObjId(myId),
            dF: {$ne: newMongoObjId(myId)},
        }, {lean: true, limit: 150, sort: "-_id"})
        for (let i of messages) {
            i['isStared'] = true
        }
        return {docs: messages}

    }

    async clearRoomMessages(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.messageService.updateMany({
            rId: dto.roomId,
        }, {$addToSet: {dF: dto.myUser._id},});
        return "All Messages has been deleted!"
    }

    async getUrlPreview(dto: MongoRoomIdDto, url: string) {
        if (!url) throw new BadRequestException("url in query param is required")
        return await getLinkPreview(url, {
            followRedirects: "follow",
        })
    }

    async roomOneSeenOn(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isOneSeen: true,});
        return "Room isOneSeen true"
    }

    async roomOneSeenOff(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        await this.roomMemberService.findOneAndUpdate({
            rId: dto.roomId,
            uId: dto.myUser._id,
        }, {isOneSeen: false,});
        return "Room isOneSeen false"
    }

    private getChannelStagesV3(dto) {
        return [
            {
                $match: dto.filter,
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { roomId: '$rId', lastSeenId: '$lSMId', userId: dto.myIdObj },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gt: ['$_id', '$$lastSeenId'] },
                                        { $eq: ['$rId', '$$roomId'] },
                                        { $ne: ['$sId', '$$userId'] }
                                    ]
                                }
                            }
                        },
                        { $count: 'uC' }
                    ],
                    as: 'unreadMessages'
                }
            },
            {
                $addFields: {
                    uC: { $ifNull: [{ $arrayElemAt: ['$unreadMessages.uC', 0] }, 0] }
                }
            },
            {
                $unset: 'unreadMessages'
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: 'rId',
                    foreignField: 'rId',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $not: {
                                        $in: [dto.myIdObj, '$dF'],
                                    },
                                },
                            },
                        },
                        {
                            $sort: {
                                _id: -1,
                            },
                        },
                        {
                            $limit: 1,
                        },
                        {
                            $addFields: {
                                isStared: {
                                    $in: [dto.myIdObj, { $ifNull: ['$stars', []] }]
                                },
                                isOneSeenByMe: {
                                    $in: [dto.myIdObj, { $ifNull: ['$oneSeenBy', []] }]
                                }
                            }
                        }
                    ],
                    as: 'lastMessageArray',
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ['$lastMessageArray', 0] }
                }
            },
            {
                $unset: ['lastMessageArray', 'lastMessage.stars', 'lastMessage.oneSeenBy']
            },
            {
                $sort: {
                    'lastMessage._id': -1,
                },
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { roomId: '$rId', lastSeenId: '$lSMId', userId: dto.myIdObj },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gt: ['$_id', '$$lastSeenId'] },
                                        { $eq: ['$rId', '$$roomId'] },
                                        { $ne: ['$sId', '$$userId'] },
                                        { $in: ['$$userId', { $ifNull: ['$mentions', []] }] }
                                    ]
                                }
                            }
                        },
                        { $count: 'mentionsCount' }
                    ],
                    as: 'mentionsData'
                }
            },
            {
                $addFields: {
                    mentionsCount: { $ifNull: [{ $arrayElemAt: ['$mentionsData.mentionsCount', 0] }, 0] }
                }
            },
            {
                $unset: 'mentionsData'
            },
        ];
    }
}