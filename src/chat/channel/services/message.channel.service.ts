/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, ForbiddenException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {RoomMemberService} from "../../room_member/room_member.service";
import {MessageService} from "../../message/message.service";
import {UserService} from "../../../api/user_modules/user/user.service";
import {UserBanService} from "../../../api/user_modules/user_ban/user_ban.service";
import {GroupSettingsService} from "../../group_settings/group_settings.service";
import {BroadcastSettingsService} from "../../broadcast_settings/broadcast_settings.service";
import {GroupMemberService} from "../../group_member/group_member.service";
import {BroadcastMemberService} from "../../broadcast_member/broadcast_member.service";
import {SocketIoService} from "../../socket_io/socket_io.service";
import {RoomMiddlewareService} from "../../room_middleware/room_middleware.service";
import {FileUploaderService} from "../../../common/file_uploader/file_uploader.service";
import {newMongoObjId} from "../../../core/utils/utils";
import {IRoomMember} from "../../room_member/entities/room_member.entity";
import {SendMessageDto} from "../dto/send.message.dto";
import {
    DeleteMessageType,
    RoomType,
    SocketEventsType
} from "../../../core/utils/enums";
import {GroupMessageStatusService} from "../../group_message_status/group_message_status.service";
import {NotificationEmitterService} from "../../../common/notification_emitter/notification_emitter.service";
import {AppConfigService} from "../../../api/app_config/app_config.service";
import {IGroupMember} from "../../group_member/entities/group_member.entity";
import {IMessage} from "../../message/entities/message.entity";
import {DeleteMessageDto} from "../dto/delete.message.dto";
import {MessagesSearchDto} from "../../message/dto/messages_search_dto";
import {jsonDecoder} from "../../../core/utils/app.validator";
import {CreateS3UploaderDto} from "../../../common/file_uploader/create-s3_uploader.dto";
import {getMsgDtoObj} from "../chat.helper";
import imageSize from "image-size";
import {NotificationEmitterChannelService} from "./notification_emitter_channel.service";
import {RoomIdAndMsgIdDto} from "../../../core/common/dto/room.id.and.msg.id.dto";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import crypto from "crypto";
import * as Buffer from "buffer";
const objectIdRegExp = /[a-f\d]{24}/gi;

@Injectable()
export class MessageChannelService {
    constructor(
        private readonly roomMemberService: RoomMemberService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly s3: FileUploaderService,
        private readonly config: ConfigService,
        private readonly socket: SocketIoService,
        private readonly middlewareService: RoomMiddlewareService,
        private readonly notificationService: NotificationEmitterChannelService,
        private readonly appConfig: AppConfigService,
        private readonly groupMember: GroupMemberService,
        private readonly broadcastMember: BroadcastMemberService,
        private readonly groupSetting: GroupSettingsService,
        private readonly broadcastSetting: BroadcastSettingsService,
        private readonly groupMessageStatusService: GroupMessageStatusService,
        private readonly userBan: UserBanService,
    ) {
    }

    async createMessage(dto: SendMessageDto, isSilent: boolean = false,) {
        let rM: IRoomMember = await this.middlewareService.isThereRoomMember(
            dto._roomId,
            dto.myUser._id,
            "rT t bId isOneSeen"
        );
        dto.isOneSeen = rM.isOneSeen ?? false
        if (!rM) throw new ForbiddenException('No room found ' + dto._roomId);
        let ban = await this.userBan.getBan(rM.uId, rM.pId)
        if (ban) throw new ForbiddenException('You dont have access ' + rM.rT)
        let isSingle = rM.rT == RoomType.Single
        let isOrder = rM.rT == RoomType.Order
        let isGroup = rM.rT == RoomType.GroupChat
        let isBroadcast = rM.rT == RoomType.Broadcast
        let isExits = await this.messageService.isMessageExist(dto.localId);
        if (isExits) throw new ForbiddenException('Message already in database ForbiddenException');
        if (dto.replyToLocalId) {
            let rToMsg: IMessage | null = await this.messageService.getByLocalId(dto.replyToLocalId)
            if (!rToMsg) throw new ForbiddenException('dto.replyToId msg not exist in db ' + dto.replyToLocalId)
            //todo s3 support
            dto._replyTo = JSON.stringify(rToMsg)
        }
        dto._messageAttachment = await this.getMessageAttachment(dto);
        if (dto.isText()) {
            dto.mentions = dto.content.match(objectIdRegExp) ?? []
        }
        if (dto.forwardLocalId) dto = await this.getForwardMessageNewDto(dto);

        await this.middlewareService.unDeleteAllRoomMembers(dto._roomId);
        if (isSingle || isOrder) {
            let peer: IRoomMember = await this.roomMemberService.findOne(
                {
                    rId: dto._roomId,
                    rT: rM.rT,
                    uId: {$ne: dto.myUser._id},
                }
            );
            if (!peer) throw new BadRequestException('Cant find the peer user in the chat data is');
            let isThereBan = await this.userBan.getBan(dto.myUser._id, peer.uId)
            if (isThereBan) throw new ForbiddenException("You dont have access");
            let newMessage = await this.messageService.create(dto);
            // let newMsg = await this.s3.getSignedMessage(newMessage);
            this.socket.io
                .to(dto._roomId.toString())
                .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMessage));
            if (!isSilent) await this.notificationService.singleChatNotification(peer.uId, newMessage);
            return newMessage;
        } else if (isGroup) {
            let createdMessage = await this.messageService.create(dto);
            await this._createStatusForGroupChat(dto._roomId, createdMessage._id);
            // let newMsg = await this.s3.getSignedMessage(createdMessage);
            this.socket.io
                .to(dto._roomId.toString())
                .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(createdMessage));
            if (!isSilent) {
                this.notificationService
                    .groupChatNotification(createdMessage, rM.t)
                    .then();
            }
            return createdMessage;
        } else if (isBroadcast) {
            let myMsg: IMessage;
            let messages: IMessage[] = await this.saveBroadcastMessages(dto);

            for (let msg of messages) {
                // msg = await this.s3.getSignedMessage(msg);
                if (msg.rId == dto._roomId) {
                    myMsg = msg as IMessage;
                }
                this.socket.io.to(msg.rId.toString()).emit(SocketEventsType.v1OnNewMessage, JSON.stringify(msg));
            }
            if (!isSilent) {
                this.notificationService.broadcastNotification(myMsg).then();
            }

            return myMsg;
        }
        throw new BadRequestException(
            'Message type ' + dto.messageType + ' not supported ',
        );
    }

    async deleteRoomMessage(dto: DeleteMessageDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        if (dto.type == DeleteMessageType.me) {
            await this.messageService.deleteMessageFromMe(
                dto.myUser._id,
                dto.messageId,
            );

            let msg = await this.messageService.findOne({
                rId: dto.roomId,
                dF: {$ne: dto.myUser._id},
            });
            if (!msg) {
                // delete the room
                await this.roomMemberService.findOneAndUpdate({
                    rId: dto.roomId,
                    uId: dto.myUser._id,
                }, {isD: true,});
            }
            //todo trans
            return "Message has been deleted from you";
        } else {
            // check in me the sender
            await this.messageService.isMeMessageSenderOrThrow(
                dto.myUser._id,
                dto.messageId,
            );
            let [m] = await Promise.all([this.messageService.getByIdOrFail(dto.messageId)]);
            if (m.sId != dto.myUser._id) {
                throw new ForbiddenException(
                    'You dont have access to delete this message',
                );
            }
            let x: IMessage = await this.messageService.findByIdAndUpdate(dto.messageId, {
                dltAt: new Date(),
            });
            this.socket.io
                .to(x.rId.toString())
                .emit(SocketEventsType.v1OnDeleteMessageFromAll, JSON.stringify(x));
            //todo trans
            return "Message has been deleted from all";
        }
    }


    async getRoomMessages(myId: string, roomId: string, dto: MessagesSearchDto) {
        let isThere = await this.middlewareService.isThereRoomMember(
            roomId,
            myId,
        );
        if (!isThere) {
            return {
                docs: []
            };
        }
        let res = await this.messageService.findAllMessagesAggregation(newMongoObjId(myId), newMongoObjId(roomId), dto);
        return {
            docs: res
        }
    }

//////////////////////////////////////////////////////////////////////////////////////utils//////////////////////////////////////////
    private sha256FromBuffer(buffer: Buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    private async getMessageAttachment(dto: SendMessageDto) {
        if (dto.isInfo()) {
            if (!dto._messageAttachment) throw new BadRequestException("for isInfo message we must include _messageAttachment")
            return dto._messageAttachment;
        }
        if (dto.isText() || dto.forwardLocalId) {
            return null;
        }

        if (dto.isCustom()) {
            return jsonDecoder(dto.attachment)
        }

        let uploaderDto = new CreateS3UploaderDto();
        uploaderDto.myUser = dto.myUser;
        if (!dto.isLocation()) {
            uploaderDto.mediaBuffer = dto._mediaFile.buffer;
            uploaderDto.fileName = dto._mediaFile.originalname;
        }

        if (dto.isImage()) {
            let imgData = await this._getImageData(dto._mediaFile.buffer);
            let key = await this.s3.uploadChatMedia(uploaderDto);
            let blurHash = null
            if (dto.attachment) {
                blurHash = jsonDecoder(dto.attachment)['blurHash'];
            }

            return {
                url: key,
                fileSize: dto._mediaFile.size,
                width: imgData.width,
                height: imgData.height,
                blurHash: blurHash,
                orientation: imgData.orientation,
                mimeType: dto._mediaFile.mimetype,
                name: dto._mediaFile.originalname,
                fileHash: this.sha256FromBuffer(dto._mediaFile.buffer),
            };
        }

        if (dto.isFile()) {
            let key = await this.s3.uploadChatMedia(uploaderDto);
            return {
                url: key,
                fileSize: dto._mediaFile.size,
                mimeType: dto._mediaFile.mimetype,
                name: dto._mediaFile.originalname,
                fileHash: this.sha256FromBuffer(dto._mediaFile.buffer),
            };
        }

        if (dto.isVoice()) {
            let dCodedAtt = jsonDecoder(dto.attachment)
            if (!dCodedAtt['duration']) throw new BadRequestException("Voice duration in milli second is required in attachment json")
            let duration = dCodedAtt['duration']
            let key = await this.s3.uploadChatMedia(uploaderDto);

            return {
                url: key,
                duration: duration,
                fileSize: dto._mediaFile.size,
                mimeType: dto._mediaFile.mimetype,
                name: dto._mediaFile.originalname,
                fileHash: this.sha256FromBuffer(dto._mediaFile.buffer),
            };
        }

        if (dto.isVideo()) {
            let mediaKey = await this.s3.uploadChatMedia(uploaderDto);
            let thumbImageData = null
            let dCodedAtt = jsonDecoder(dto.attachment)
            if (dto._secondMediaFile) {
                let imgData = await this._getImageData(dto._secondMediaFile.buffer);

                uploaderDto.mediaBuffer = dto._secondMediaFile.buffer;
                thumbImageData = {}
                thumbImageData['mimeType'] = dto._secondMediaFile.mimetype;
                thumbImageData['url'] = await this.s3.uploadChatMedia(uploaderDto);
                thumbImageData['fileSize'] = dto._secondMediaFile.size;
                thumbImageData['orientation'] = imgData.orientation;
                thumbImageData['width'] = imgData.width;
                thumbImageData['blurHash'] = dCodedAtt['thumbImage']['blurHash'] ?? null;
                thumbImageData['height'] = imgData.height;
                thumbImageData['name'] = dto._secondMediaFile.originalname;
                thumbImageData['fileHash']= this.sha256FromBuffer(dto._secondMediaFile.buffer)
            }

            // if (!dCodedAtt['duration']) throw new BadRequestException("duration must be in integer millisecond")

            return {
                url: mediaKey,
                duration: dCodedAtt['duration'] ?? null,
                thumbImage: thumbImageData,
                fileSize: dto._mediaFile.size,
                mimeType: dto._mediaFile.mimetype,
                name: dto._mediaFile.originalname,
                fileHash: this.sha256FromBuffer(dto._mediaFile.buffer),
            };
        }

        if (dto.isLocation()) {
            let att = jsonDecoder(dto.attachment)
            if (!att['lat']) throw new BadRequestException("lat is required as String")
            if (!att['long']) throw new BadRequestException("long is required as String")
            if (!att['linkPreviewData']) throw new BadRequestException("linkPreviewData is required as {}")
            if (!att['linkPreviewData']['title']) throw new BadRequestException("linkPreviewData title is required as string")
            if (!att['linkPreviewData']['description']) throw new BadRequestException("linkPreviewData description is required as string")
            // const apiKey = this.config.getOrThrow('mapsApiKey')
            // let data = await this.httpService.axiosRef.get(
            //     `https://maps.googleapis.com/maps/api/staticmap?center=${att['lat']},${att['long']}&zoom=15&size=600x400&key=${apiKey}`,
            //     {responseType: "arraybuffer"}
            // );
            // uploaderDto.mediaBuffer = data.data;
            // let key = await this.s3.uploadChatMedia(uploaderDto);
            // att['linkPreviewData']['image'] = {
            //     url: key,
            //     width: 600,
            //     height: 400,
            //     fileSize: 50 * 1024,
            //     mimeType: "image/png",
            //     name: att['lat'] + ".png"
            // };
            return att
        }

        throw new BadRequestException(+dto.messageType + ' not supported');
    }

    private async getForwardMessageNewDto(dto: SendMessageDto) {
        let fToMsg: any = await this.messageService.getByLocalId(dto.forwardLocalId);
        if (!fToMsg) throw new ForbiddenException("cant find the forwarded message id " + dto.forwardLocalId)
        dto._messageAttachment = fToMsg.msgAtt;
        dto.content = fToMsg.c;
        dto.messageType = fToMsg.mT;
        dto._replyTo = undefined;
        dto.replyToLocalId = undefined
        return dto;
    }

    private async saveBroadcastMessages(dto: SendMessageDto) {
        let broadcastId = dto._roomId;

        let broadcastUsers = await this.broadcastMember.findAll(
            {
                bId: broadcastId
            },
            'rId uId userData'
        );
        let messagesToCreate: SendMessageDto[] = []
        for (let bUser of broadcastUsers) {
            let msgDto = getMsgDtoObj({
                _id: newMongoObjId().toString(),
                mT: dto.messageType,
                att: dto._messageAttachment,
                rId: bUser.rId,
                peerData: bUser.userData,
                user: dto.myUser,
                content: dto.content
            })
            messagesToCreate.push(msgDto)
        }
        let parentBroadcastMsgId = newMongoObjId();
        // doing this step to change the order or messages
        for (let m of messagesToCreate) {
            m._pBId = parentBroadcastMsgId.toString();
        }
        let myMsgDto = getMsgDtoObj({
            _id: parentBroadcastMsgId.toString(),
            mT: dto.messageType,
            att: dto._messageAttachment,
            rId: broadcastId,
            user: dto.myUser,
            localId: dto.localId,
            content: dto.content,
        })
        messagesToCreate.push(myMsgDto)
        return await this.messageService.createMany(messagesToCreate);
    }


    private async _getImageData(buffer: Buffer) {
        let imgWidth = 1
        let imgHeight = 1
        let imgOrientation = 1
        try {
            let imgData =   imageSize(buffer);
            imgWidth = imgData.width ?? 1;
            imgHeight = imgData.height ?? 1;
            imgOrientation = imgData.orientation ?? 1;
        } catch (err) {

        }
        return {
            width: imgWidth,
            height: imgHeight,
            orientation: imgOrientation
        }
    }

    private async _createStatusForGroupChat(_roomId: string, mId: string) {
        let members: IGroupMember[] = await this.groupMember.findAll({
            rId: _roomId,
        }, "uId")
        await this.groupMessageStatusService.createMany(members.map(value => {
            return {
                mId: mId,
                rId: _roomId,
                uId: value.uId
            }
        }));
    }

    async starRoomMessage(dto: RoomIdAndMsgIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        let msg = await this.messageService.findById(dto.messageId)
        if (!msg) throw new BadRequestException("message not exists!")
        if (msg.rId.toString() != dto.roomId) throw new BadRequestException("message not exists in this room!")
        await this.messageService.findByIdAndUpdate(dto.messageId, {
            $addToSet: {stars: newMongoObjId(dto.myUser._id)}
        })
        return "Done"
    }

    async unStarRoomMessage(dto: RoomIdAndMsgIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        let msg = await this.messageService.findById(dto.messageId)
        if (!msg) throw new BadRequestException("message not exists!")
        if (msg.rId.toString() != dto.roomId) throw new BadRequestException("message not exists in this room!")
        await this.messageService.findByIdAndUpdate(dto.messageId, {
            $pull: {stars: newMongoObjId(dto.myUser._id)}
        })
        return "Done"
    }

    async getMyAllStarMessages(dto: MongoRoomIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(dto.roomId, dto.myUser._id);
        let res = await this.messageService.findAll({
            rId: dto.roomId,
            dF: {$ne: newMongoObjId(dto.myUser._id)},
            stars: newMongoObjId(dto.myUser._id),
        }, {lean: true, limit: 150, sort: "-_id"})
        for (let i of res) {
            i['isStared'] = true
        }
        return {docs: res}
    }

    async oneSeeThisMessage(dto: RoomIdAndMsgIdDto) {
        await this.middlewareService.isThereRoomMemberOrThrow(
            dto.roomId,
            dto.myUser._id,
        );
        let msg: IMessage = await this.messageService.getByIdOrFail(dto.messageId);
        if (!msg.isOneSeen) throw new BadRequestException("Msg cant update is should be one seen true")

        if (msg.sId.toString() == dto.myUser._id.toString()) return "You the sender"

        await this.messageService.findByIdAndUpdate(dto.messageId, {
            $addToSet: {
                oneSeenBy: dto.myUser._id
            }
        })
        return "Msg updated";
    }
}