/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from "@nestjs/common";
import {ChannelService} from "./channel.service";

import {ConfigService} from "@nestjs/config";
import {v4 as uuidv4} from 'uuid';
import {KickMembersDto} from "../dto/kick.members.dto";
import {CreateBroadcastRoomDto} from "../dto/create-broadcast-room.dto";
import {CreateSingleRoomDto} from "../dto/create-single-room.dto";
import mongoose from "mongoose";
import {getMsgDtoObj} from "../chat.helper";
import {SocketIoService} from "../../socket_io/socket_io.service";
import {remove} from "remove-accents";
import {PaginationParameters} from "mongoose-paginate-v2";
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
import {RoomMiddlewareService} from "../../room_middleware/room_middleware.service";
import {FileUploaderService} from "../../../common/file_uploader/file_uploader.service";
import {newMongoObjId} from "../../../core/utils/utils";
import {ISingleRoomSettings} from "../../single_room_settings/entities/single_room_setting.entity";
import {IUser} from "../../../api/user_modules/user/entities/user.entity";
import {
    MessageInfoType,
    MessageStatusType,
    MessageType,
    RoomType,
    S3UploaderTypes,
    SocketEventsType
} from "../../../core/utils/enums";
import {MongoPeerIdDto} from "../../../core/common/dto/mongo.peer.id.dto";
import {CreateOrderRoomDto} from "../../../core/common/dto/mongo.peer.id.order.id.dto";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {IRoomMember} from "../../room_member/entities/room_member.entity";
import {NotificationEmitterService} from "../../../common/notification_emitter/notification_emitter.service";
import {AppConfigService} from "../../../api/app_config/app_config.service";
import {IAppConfig} from "../../../api/app_config/entities/app_config.entity";
import {IBroadcastMember} from "../../broadcast_member/entities/broadcast_member.entity";
import {MongoIdsDto} from "../../../core/common/dto/mongo.ids.dto";
import {UsersSearchDto} from "../dto/users_search_dto";
import {IBroadcastSetting} from "../../broadcast_settings/entities/broadcast_setting.entity";
import {MessageStatusParamDto} from "../dto/message_status_param_dto";
import {DefaultPaginateParams} from "../../../core/common/dto/paginateDto";
import {NotificationEmitterChannelService} from "./notification_emitter_channel.service";

@Injectable()
export class BroadcastChannelService {
    constructor(
        private readonly channelService: ChannelService,
        private readonly roomMemberService: RoomMemberService,
        private readonly singleRoomSetting: SingleRoomSettingsService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly s3: FileUploaderService,
        private readonly config: ConfigService,
        private readonly socketIoService: SocketIoService,
        private readonly middlewareService: RoomMiddlewareService,
        private readonly broadcastSetting: BroadcastSettingsService,
        private readonly broadcastMember: BroadcastMemberService,
        private readonly notificationService: NotificationEmitterChannelService,
        private readonly appConfig: AppConfigService,
        private readonly userBan: UserBanService,
    ) {
    }

    async createBroadcastChat(dto: CreateBroadcastRoomDto, session?: mongoose.ClientSession) {
        let appSetting: IAppConfig = await this.appConfig.getConfig();
        let maxBroadcastCount = appSetting.maxBroadcastMembers;
        if (dto.peerIds.length + 1 > maxBroadcastCount) throw new BadRequestException(`Max broadcast count is ${maxBroadcastCount}`);
        if (dto.peerIds.includes(dto.myUser._id)) throw new BadRequestException('Your id should not included');
        let config: IAppConfig = await this.appConfig.getConfig();
        dto.imgUrl = config.broadcastIcon

        if (dto.imageBuffer) {
            dto.imgUrl = await this.s3.putImageCropped(
                dto.imageBuffer,
                dto.myUser._id,
            );
            dto.imageBuffer = undefined;
        }
        let broadcastId = newMongoObjId().toString();
        //create my broadcast room member only
        await this.roomMemberService.create(
            {
                uId: dto.myUser._id,
                rId: broadcastId,
                lSMId: broadcastId,
                rT: RoomType.Broadcast,
                t: dto.broadcastName,
                tEn: remove(dto.broadcastName),
                img: dto.imgUrl
            },
            session
        );

        //join its socket
        await this.socketIoService.joinRoom({
            roomId: broadcastId,
            usersIds: [dto.myUser._id.toString()],
        });

        //create broadcast members
        let broadcastMembers: Partial<IBroadcastMember>[] = [];

        for (let uId of dto.peerIds) {
            let ban = await this.userBan.getBan(dto.myUser._id, uId)
            if (ban) continue;

            let rId = await this.middlewareService.getSingleRoomId(uId, dto.myUser._id);
            let peerUser: IUser = await this.userService.findByIdOrThrow(uId, "fullName fullNameEn userImage")
            if (rId) {
                //there are single room between us so i will use it
                broadcastMembers.push({
                    uId: uId,
                    rId: rId,
                    bId: broadcastId,
                    userData: {
                        _id: uId,
                        userImage: peerUser.userImage,
                        fullName: peerUser.fullName,
                        fullNameEn: peerUser.fullNameEn,

                    },
                });
                let sendMsgDto = getMsgDtoObj({
                    mT: MessageType.Info,
                    user: dto.myUser,
                    rId: rId.toString(),
                    att: {
                        adminName: dto.myUser.fullName,
                        targetName: dto.broadcastName,
                        targetId: uId,
                        action: MessageInfoType.AddToBroadcast
                    },
                    content: `${dto.myUser.fullName} added you to new broadcast ${dto.broadcastName} ${config.roomIcons.broadcast}`
                });
                let newMsg = await this.messageService.create(sendMsgDto, session);
                this.socketIoService.io
                    .to(rId.toString())
                    .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMsg));
            } else {
                // not room between us, so I will create one first and join myself and him on socket !!
                let cDto = new CreateSingleRoomDto();
                cDto.myUser = dto.myUser;
                cDto.peerId = uId;
                let newRoomId = newMongoObjId().toString()
                await this._createPeerRoom(cDto, newRoomId, peerUser, session)
                broadcastMembers.push({
                    uId: uId,
                    rId: newRoomId,
                    bId: broadcastId,
                    userData: {
                        _id: uId,
                        userImage: peerUser.userImage,
                        fullName: peerUser.fullName,
                        fullNameEn: peerUser.fullNameEn,

                    },
                });
                let sendMsgDto = getMsgDtoObj({
                    mT: MessageType.Info,
                    user: dto.myUser,
                    rId: newRoomId.toString(),
                    att: {
                        adminName: dto.myUser.fullName,
                        targetName: dto.broadcastName,
                        targetId: uId,
                        action: MessageInfoType.AddToBroadcast
                    },
                    content: `${dto.myUser.fullName} added you to new broadcast ${dto.broadcastName} ${config.roomIcons.broadcast}`
                });

                let newMsg = await this.messageService.create(sendMsgDto, session);
                this.socketIoService.io
                    .to(newRoomId.toString())
                    .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMsg));
            }
        }
        let sendMsgDto = getMsgDtoObj({
            mT: MessageType.Info,
            user: dto.myUser,
            rId: broadcastId.toString(),
            att: {
                adminName: dto.myUser.fullName,
                targetName: dto.broadcastName,
                targetId: dto.myUser._id,
                action: MessageInfoType.AddToBroadcast
            },
            content: dto.broadcastName + ' created by me ' + config.roomIcons.broadcast
        });
        // create message to me
        let myMsg = await this.messageService.create(sendMsgDto, session);
        this.socketIoService.io
            .to(broadcastId.toString())
            .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(myMsg));

        //create broadcast members
        await this.broadcastMember.createMany(broadcastMembers, session);
        //create broadcast settings
        await this.broadcastSetting.create({
            _id: broadcastId,
            cId: dto.myUser._id,
            bImg: dto.imgUrl,
            bName: dto.broadcastName
        }, session);

        this.notificationService.broadcastNotification(myMsg).then();
        // await session.commitTransaction();
        //return my broadcast
        return this.channelService._getOneFullRoomModel({roomId: broadcastId, userId: dto.myUser._id});
    }

    async addMembersToBroadcast(bId: string, dto: MongoIdsDto, session?: mongoose.ClientSession) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(bId, dto.myUser._id)
        if (rM.rT != RoomType.Broadcast) throw new BadRequestException("it must be broadcast!")
        let added = 0
        if (dto.ids.includes(dto.myUser._id)) throw new BadRequestException('My id should not included');
        let _appCfg: IAppConfig = await this.appConfig.getConfig();
        let maxBroadcastCount = _appCfg.maxBroadcastMembers;
        let count = await this.broadcastMember.getBroadcastMembersCount(rM.rId);
        let newCount = dto.ids.length + count;
        if (newCount > maxBroadcastCount) throw new BadRequestException(`Max broadcast count is ${maxBroadcastCount}`);

        let broadcastMembers: Partial<IBroadcastMember>[] = [];

        for (let uId of dto.ids) {
            let ban = await this.userBan.getBan(dto.myUser._id, uId)
            if (ban) continue;
            let bUser = await this.broadcastMember.findOne({
                bId: bId,
                uId: uId
            });
            //user already exist in broadcast skip it
            if (bUser) continue;
            let rId = await this.middlewareService.getSingleRoomId(uId, dto.myUser._id);
            if (rId) {
                //there are single room between us so i will use it
                let peerUser = await this.userService.findByIdOrThrow(uId, "fullName fullNameEn userImage")
                broadcastMembers.push({
                    uId: uId,
                    rId: rId,
                    bId: bId,
                    userData: {
                        _id: uId,
                        userImage: peerUser.userImage,
                        fullName: peerUser.fullName,
                        fullNameEn: peerUser.fullNameEn,

                    },

                });
                let sendMsgDto = getMsgDtoObj({
                    mT: MessageType.Info,
                    user: dto.myUser,
                    rId: rId.toString(),
                    att: {
                        adminName: dto.myUser.fullName,
                        targetName: rM.t,
                        targetId: uId,
                        action: MessageInfoType.AddToBroadcast
                    },
                    content: `${dto.myUser.fullName} added you to new broadcast ${rM.t} ${_appCfg.roomIcons.broadcast}`,
                });
                let newMsg = await this.messageService.create(sendMsgDto, session);
                this.socketIoService.io
                    .to(rId.toString())
                    .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMsg));
            } else {
                // not room between us, so I will create one first and join myself and him on socket !!
                let cDto = new CreateSingleRoomDto();
                cDto.myUser = dto.myUser;
                cDto.peerId = uId;
                let newRoomId = newMongoObjId().toString()
                let peerUser = await this.userService.findByIdOrThrow(uId, "fullName fullNameEn userImage")
                await this._createPeerRoom(cDto, newRoomId, peerUser, session)
                broadcastMembers.push({
                    uId: uId,
                    rId: newRoomId,
                    bId: bId,
                    userData: {
                        _id: uId,
                        userImage: peerUser.userImage,
                        fullName: peerUser.fullName,
                        fullNameEn: peerUser.fullNameEn,
                    },

                });
                let sendMsgDto = getMsgDtoObj({
                    mT: MessageType.Info,
                    user: dto.myUser,
                    rId: newRoomId.toString(),
                    att: {
                        adminName: dto.myUser.fullName,
                        targetName: rM.t,
                        targetId: uId,
                        action: MessageInfoType.AddToBroadcast
                    },

                    content: `${dto.myUser.fullName} added you to new broadcast ${rM.t} ${_appCfg.roomIcons.broadcast}`,
                });
                let newMsg = await this.messageService.create(sendMsgDto, session);
                this.socketIoService.io
                    .to(newRoomId.toString())
                    .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMsg));
            }
            ++added
        }
        await this.broadcastMember.createMany(broadcastMembers, session);
        return "Users added successfully count is " + added
    }

    async kickBroadcastMember(dto: KickMembersDto) {

        let rM = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Broadcast) throw new BadRequestException("it must be broadcast!")
        if (dto.myUser._id == dto.peerId) {
            throw new BadRequestException("You cant kick your self!")
        }
        // delete broadcast member
        await this.broadcastMember.deleteOne({
            bId: dto.roomId,
            uId: dto.peerId
        });
        return "Successfully Kicked the user"
    }

    async getBroadcastMembers(myUser: IUser, dto: UsersSearchDto, roomId: string) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            roomId,
            myUser._id,
        );

        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 30,
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
            paginationParameters[1].limit = 30
        }
        paginationParameters[0] = {
            bId: roomId,
            ...dto.getFilter("userData.fullNameEn")
        }
        return this.broadcastMember.paginate(paginationParameters);

    }

    async updateTitle(dto: MongoRoomIdDto, title: string) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Broadcast) throw new BadRequestException("it must be broadcast!")
        await this.roomMemberService.findByRoomIdAndUpdate(
            dto.roomId, {
                t: title,
                tEn:remove(title)
            })
        return "room has been renamed successfully"
    }

    async updateImage(dto: MongoRoomIdDto, file: any) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Broadcast) throw new BadRequestException("it must be broadcast!")
        let keyImage = `v-public/${dto.myUser._id}/${S3UploaderTypes.profileImage}-${uuidv4()}.jpg`;
        let url = await this.s3.putImageCropped(file.buffer, keyImage)
        await this.roomMemberService.findByRoomIdAndUpdate(
            dto.roomId, {
                img: url
            })
        return url
    }

    async getBroadcastMyInfo(dto: MongoRoomIdDto) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id)
        if (rM.rT != RoomType.Broadcast) {
            throw new BadRequestException("Room must be broadcast to continue " + rM.rT)
        }
        let count = await this.broadcastMember.getBroadcastMembersCount(dto.roomId)
        let broadcastSettings: IBroadcastSetting = await this.broadcastSetting.findByIdOrThrow(
            dto.roomId
        );
        return {
            totalUsers: count,
            broadcastSettings: broadcastSettings
        }
    }

    async getBroadcastMessageInfo(dto: MessageStatusParamDto, x: DefaultPaginateParams) {
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: x.getLimit(),
                    page: x.getPage(),
                    sort: "sAt dAt",
                    select: "peerData sAt dAt createdAt",
                    lean: true,
                },
            },
        ).get()

        paginationParameters[0] = {
            //  rId: dto.roomId,
            pBId: dto.messageId,
        }
        if (dto.type == MessageStatusType.Seen) {
            paginationParameters[0]['sAt'] = {
                $ne: null
            }
        } else {
            //deliver
            paginationParameters[0]['sAt'] = {
                $eq: null
            }
            paginationParameters[0]['dAt'] = {
                $ne: null
            }
        }
        let data = await this.messageService.paginated(paginationParameters)
        for (let d of data.docs) {
            d['userData'] = d['peerData']
            delete d['peerData']
        }
        return data
    }

    //--------private functions ----------

    private async _createPeerRoom(dto: CreateSingleRoomDto, newRoomId: string, peerUser: IUser, session?: mongoose.ClientSession) {
        await this.singleRoomSetting.create({
            _id: newRoomId,
            cId: dto.myUser._id,
            pId: dto.peerId,
        }, session)
        /// create 2 room members
        await this.roomMemberService.createMany([
            {
                uId: dto.myUser._id,
                rId: newRoomId,
                lSMId: newRoomId,
                rT: RoomType.Single,
                t: peerUser.fullName,
                img: peerUser.userImage,
                pId: dto.peerId,
                isD: true,
                tEn: peerUser.fullNameEn,

            },
            {
                uId: peerUser._id,
                rId: newRoomId,
                lSMId: newRoomId,
                rT: RoomType.Single,
                t: dto.myUser.fullName,
                img: dto.myUser.userImage,
                pId: dto.myUser._id,
                isD: true,
                tEn: dto.myUser.fullNameEn,

            },

        ], session)
        await this.socketIoService.joinRoom({
            usersIds: [dto.peerId, dto.myUser._id.toString()],
            roomId: newRoomId,
        });
    }

    async getAvailableUsersToAdd(dto: Object, roomId: string, myId) {
        let rM = await this.middlewareService.isThereRoomMemberOrThrow(roomId, myId)
        if (rM.rT != RoomType.Broadcast) {
            throw new BadRequestException("Room must be broadcast to continue " + rM.rT)
        }
        let outUsers = []
        //get my bans
        let myBans = await this.userBan.getMyBlockTheyAndMe(myId)
        outUsers.push(myId)
        outUsers.push(...myBans)
        let broadcastMembers = await this.broadcastMember.findAll({bId: roomId}, "uId")
        outUsers.push(...broadcastMembers.map(value => value.uId.toString()))
        return this.userService.searchV2(dto, outUsers)
    }
}