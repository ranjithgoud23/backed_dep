/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {NotificationEmitterService, rExp} from "../../../common/notification_emitter/notification_emitter.service";
import {UserService} from "../../../api/user_modules/user/user.service";
import {RoomMemberService} from "../../room_member/room_member.service";
import {RoomMiddlewareService} from "../../room_middleware/room_middleware.service";
import {GroupMemberService} from "../../group_member/group_member.service";
import {BroadcastMemberService} from "../../broadcast_member/broadcast_member.service";
import {UserDeviceService} from "../../../api/user_modules/user_device/user_device.service";
import {IMessage} from "../../message/entities/message.entity";
import {PushKeyAndProvider} from "../../../core/utils/interfaceces";
import {IRoomMember} from "../../room_member/entities/room_member.entity";
import {NotificationData} from "../../../common/notification_emitter/notification.event";
import {NotificationType} from "../../../core/utils/enums";


@Injectable()
export class NotificationEmitterChannelService {
    constructor(
        readonly emitterService: NotificationEmitterService,
        private readonly middlewareService: RoomMiddlewareService,
        private readonly groupMember: GroupMemberService,
        private readonly broadcastMember: BroadcastMemberService,
        private readonly userDevice: UserDeviceService,
    ) {
    }

    _parseMessageMentions(body: string) {
        return body.replaceAll(rExp, substring => {
            try {
                return substring.split(":")[0].substring(1)
            } catch (e) {
                console.log("Error while _parseMessageMentions in NotificationEmitterService")
                return substring
            }

        })
    }

    async singleChatNotification(peerId: string, msg: IMessage) {
        let tokens = new PushKeyAndProvider([], [], []);
        let rM: IRoomMember = await this.middlewareService.isThereRoomMemberOrThrow(msg.rId, peerId);
        if (rM.isM) {
            return;
        }
        let devices = await this.userDevice.getUserPushTokens(peerId);
        tokens.fcm = devices.fcm
        tokens.oneSignal = devices.oneSignal

        this.emit({
            data: {
                type: NotificationType.SingleChat,
                vMessage: JSON.stringify(msg),
                fromVChat: "true"
            },
            tag: msg.rId,
            body: msg.isOneSeen ? "1️⃣" : this._parseMessageMentions(msg.c),
            title: msg.sName,
            tokens: []
        }, tokens);
    }

    private emit(notificationData: NotificationData, tokens: PushKeyAndProvider) {
        if (tokens.fcm.length != 0) {
            notificationData.tokens = tokens.fcm;
            this.emitterService.fcmSend(notificationData);
        }
        if (tokens.oneSignal.length != 0) {
            notificationData.tokens = tokens.oneSignal;
            this.emitterService.oneSignalSend(notificationData);
        }
    }

    async groupChatNotification(msg: IMessage, groupName: string) {
        let tokens = new PushKeyAndProvider([], [], []);
        let groupId = msg.rId;
        let members = await this.groupMember.findAll({rId: groupId}, "uId");
        for (let m of members) {
            let rM: IRoomMember = await this.middlewareService.isThereRoomMember(msg.rId, m.uId);
            if (rM == null) continue;
            if (!rM.isM && m.uId.toString() != msg.sId) {
                let d = await this.userDevice.getUserPushTokens(m.uId);
                tokens.fcm.push(...d.fcm)
                tokens.oneSignal.push(...d.oneSignal)
            }
        }

        this.emit({
            data: {
                type: NotificationType.GroupChat,
                vMessage: JSON.stringify(msg),
                fromVChat: "true"
            },
            tag: msg.rId,
            body: `${msg.sName} : ${msg.isOneSeen == true ? "1️⃣" : this._parseMessageMentions(msg.c)}`,
            title: groupName + " " + "👥",
            tokens: []
        }, tokens);

    }

    async broadcastNotification(msg: IMessage) {
        let tokens = new PushKeyAndProvider([], [], []);
        let broadcastId = msg.rId;
        let members = await this.broadcastMember.findAll({bId: broadcastId}, 'rId uId');
        for (let m of members) {
            let rM: IRoomMember = await this.middlewareService.isThereRoomMember(m.rId, m.uId);
            if (rM == null) continue;
            if (!rM.isM && m.uId.toString() != msg.sId) {
                let d = await this.userDevice.getUserPushTokens(m.uId);
                tokens.fcm.push(...d.fcm)
                tokens.oneSignal.push(...d.oneSignal)
            }
        }

        this.emit({
            data: {
                type: NotificationType.BroadcastChat,
                vMessage: JSON.stringify(msg),
                fromVChat: "true"
            },
            tag: msg.rId,
            body: msg.isOneSeen ? "1️⃣" : this._parseMessageMentions(msg.c),
            title: msg.sName,
            tokens: []
        }, tokens);
    }
}
