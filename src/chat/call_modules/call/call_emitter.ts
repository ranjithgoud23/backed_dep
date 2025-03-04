/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from "@nestjs/common";
import {NotificationEmitterService, rExp} from "../../../common/notification_emitter/notification_emitter.service";
import {UserService} from "../../../api/user_modules/user/user.service";
import {UserDeviceService} from "../../../api/user_modules/user_device/user_device.service";
import {NotificationData} from "../../../common/notification_emitter/notification.event";
import {IMessage} from "../../message/entities/message.entity";
import {NotificationType, Platform} from "../../../core/utils/enums";
import {PushKeyAndProvider} from "../../../core/utils/interfaceces";
import {GroupMemberService} from "../../group_member/group_member.service";
import {PushCallDataModel} from "../utils/push-call-data.model";

@Injectable()
export class CallEmitter {
    constructor(
        readonly emitterService: NotificationEmitterService,
        private readonly userService: UserService,
        private readonly groupMember: GroupMemberService,
        private readonly userDevice: UserDeviceService,
    ) {
    }

    async groupRingNotify(model: PushCallDataModel) {
        let tokens = new PushKeyAndProvider([], [], []);
        let groupId = model.roomId;
        let members = await this.groupMember.findAll({
            rId: groupId,
            uId: {$ne: model.callerId}
        }, "uId");
        for (let member of members) {
            let androidDevices = await this.userDevice.getUserPushTokens(member.uId, Platform.Android);
            tokens.fcm.push(...androidDevices.fcm)
            tokens.oneSignal.push(...androidDevices.oneSignal)
            let iosDevices = await this.userDevice.getUserPushTokens(member.uId, Platform.Ios);
            tokens.voipKeys.push(...iosDevices.voipKeys)
        }
        this.emit({
            data: {
                type: NotificationType.Call,
                fromVChat: "true",
                callData: JSON.stringify(model)
            },
            tag: "",
            body: "NEW CALL",
            title: "NEW CALL",
            sound: "ringtone",
            isSilent: true,
            tokens: []
        }, tokens);
        this.emitVoip(model, tokens.voipKeys);

    }

    async singleRingNotify(peerId: string, model: PushCallDataModel) {
        let tokens = new PushKeyAndProvider([], [], []);
        let androidDevices = await this.userDevice.getUserPushTokens(peerId, Platform.Android);
        tokens.fcm = androidDevices.fcm
        tokens.oneSignal = androidDevices.oneSignal
        let iosDevices = await this.userDevice.getUserPushTokens(peerId, Platform.Ios);
        tokens.voipKeys = iosDevices.voipKeys
        this.emit({
            data: {
                type: NotificationType.Call,
                fromVChat: "true",
                callData: JSON.stringify(model)
            },
            tag: "",
            body: "NEW CALL",
            title: "NEW CALL",
            sound: "ringtone",
            isSilent: true,
            tokens: []
        }, tokens);


        this.emitVoip(model, tokens.voipKeys);
    }

    async singleChatNotification(peerId: string, msg: IMessage) {
        let tokens = new PushKeyAndProvider([], [], []);

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
            body: this._parseMessageMentions(msg.c),
            title: msg.sName,
            tokens: []
        }, tokens);

    }


    private _parseMessageMentions(body: string) {
        return body.replaceAll(rExp, substring => {
            try {
                return substring.split(":")[0].substring(1)
            } catch (e) {
                return substring
            }

        })
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

    private emitVoip(model: PushCallDataModel, voipKeys: any[]) {
        if (voipKeys.length == 0) return;

        this.emitterService.sendVoipCall(voipKeys, model);
    }
}