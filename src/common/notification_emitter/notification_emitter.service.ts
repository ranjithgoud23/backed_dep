/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from "@nestjs/common";
import {EventEmitter2} from "@nestjs/event-emitter";
import {UserService} from "../../api/user_modules/user/user.service";
import {UserDeviceService} from "../../api/user_modules/user_device/user_device.service";
import {NotificationType, PushTopics} from "../../core/utils/enums";
import {IMessage} from "../../chat/message/entities/message.entity";
import {RoomMemberService} from "../../chat/room_member/room_member.service";
import {RoomMiddlewareService} from "../../chat/room_middleware/room_middleware.service";
import {GroupMemberService} from "../../chat/group_member/group_member.service";
import {BroadcastMemberService} from "../../chat/broadcast_member/broadcast_member.service";
import {PushKeyAndProvider} from "../../core/utils/interfaceces";
import {IRoomMember} from "../../chat/room_member/entities/room_member.entity";
import {NotificationData} from "./notification.event";
import {IUser} from "../../api/user_modules/user/entities/user.entity";
import {PushCallDataModel} from "../../chat/call_modules/utils/push-call-data.model";

export  const rExp: RegExp = new RegExp("\\[(@[^:]+):([^\\]]+)\]", "g");

@Injectable()
export class NotificationEmitterService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly userDevice: UserDeviceService,
    ) {
    }

    async adminNotification(title: string, body: string) {
        this.eventEmitter.emit("send.all.active", title, body);
    }

    async subscribeOnesignalTopic(token: string, topic: PushTopics) {
        this.eventEmitter.emit("topic.onesignal", {
            token,
            topic
        });
    }

    async subscribeFcmTopic(token: string, topic: PushTopics) {
        this.eventEmitter.emit("topic.fcm", {
            token,
            topic
        });
    }

    sendVoipCall(tokens: string[], model: PushCallDataModel) {
        this.eventEmitter.emit("send.all.voip", {
            tokens,
            model
        });
    }

    async unSubscribeFcmTopic(token: string, topic: PushTopics) {
        this.eventEmitter.emit("un.sub", {
            token,
            topic
        });
    }

    fcmSend(notificationData: NotificationData) {
        this.eventEmitter.emit("send.fcm", notificationData);
    }


    oneSignalSend(notificationData: NotificationData) {
        this.eventEmitter.emit("send.onesignal", notificationData);
    }

}
