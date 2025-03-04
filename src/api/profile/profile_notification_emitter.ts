/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from "@nestjs/common";
import {NotificationEmitterService} from "../../common/notification_emitter/notification_emitter.service";
import {UserService} from "../user_modules/user/user.service";
import {UserDeviceService} from "../user_modules/user_device/user_device.service";
import {SendMessageDto} from "../../chat/channel/dto/send.message.dto";
import {PushKeyAndProvider} from "../../core/utils/interfaceces";
import {NotificationType} from "../../core/utils/enums";
import {NotificationData} from "../../common/notification_emitter/notification.event";
import {IUser} from "../user_modules/user/entities/user.entity";

@Injectable()
export class ProfileNotificationEmitter {
    constructor(
        readonly emitterService: NotificationEmitterService,
        private readonly userService: UserService,
        private readonly userDevice: UserDeviceService,
    ) {
    }


    async notify(peerId: string, myUser: IUser) {
        let tokens = new PushKeyAndProvider([], [], []);
        let devices = await this.userDevice.getUserPushTokens(peerId);
        tokens.fcm = devices.fcm
        tokens.oneSignal = devices.oneSignal

        this.emit({
            data: {
                type: NotificationType.ChatReq,
                fromVChat: "true"
            },
            tag: myUser._id.toString(),
            body: "💬 Chat Request 💬",
            title: myUser.fullName,
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
}