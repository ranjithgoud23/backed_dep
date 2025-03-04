/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {NotificationEmitterService} from "../../../common/notification_emitter/notification_emitter.service";
import {ChannelService} from "../../../chat/channel/services/channel.service";
import {RoomMemberService} from "../../../chat/room_member/room_member.service";
import {MessageService} from "../../../chat/message/message.service";
import {UserService} from "../../user_modules/user/user.service";
import {SingleRoomSettingsService} from "../../../chat/single_room_settings/single_room_settings.service";
import {OrderRoomSettingsService} from "../../../chat/order_room_settings/single_room_settings.service";
import {GroupSettingsService} from "../../../chat/group_settings/group_settings.service";
import {BroadcastSettingsService} from "../../../chat/broadcast_settings/broadcast_settings.service";
import {ConfigService} from "@nestjs/config";
import {AppConfigService} from "../../app_config/app_config.service";
import {UserDeviceService} from "../../user_modules/user_device/user_device.service";
import {SocketIoService} from "../../../chat/socket_io/socket_io.service";
import {MessageType, RoomType} from "../../../core/utils/enums";
import {newMongoObjId} from "../../../core/utils/utils";

@Injectable()
export class ChannelAdminService {
    constructor(
        private readonly roomService: RoomMemberService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly singleSettingService: SingleRoomSettingsService,
        private readonly orderRoomSettingsService: OrderRoomSettingsService,
        private readonly groupSettingService: GroupSettingsService,
        private readonly broadcastSettingService: BroadcastSettingsService,
        private readonly config: ConfigService,
    ) {
    }

    async getRoomCounterForPeer(peerId: string) {
        let single = await this.roomService.findCount({
            uId: peerId,
            rT: RoomType.Single
        })
        let group = await this.roomService.findCount({
            uId: peerId,
            rT: RoomType.GroupChat
        })

        let broadcast = await this.roomService.findCount({
            uId: peerId,
            rT: RoomType.Broadcast
        })
        let order = await this.roomService.findCount({
            uId: peerId,
            rT: RoomType.Order
        })
        return {
            "single": single,
            "order": order,
            "group": group,
            "broadcast": broadcast,
            "total": single + order + group + broadcast
        }
    }

    async getRoomCounter() {
        let single = await this.singleSettingService.findCount()
        let order = await this.orderRoomSettingsService.findCount()
        let group = await this.groupSettingService.findCount()
        let broadcast = await this.broadcastSettingService.findCount()
        return {
            "single": single,
            "order": order,
            "group": group,
            "broadcast": broadcast,
            "total": single + order + group + broadcast
        }
    }

    async getMessagesCounterForPeer(peerId: string) {
        return {
            "messages": await this.messageService.findCount({
                sId: peerId
            }),
            "textMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Text},
                sId: peerId
            }),
            "imageMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Image},
                sId: peerId
            }),
            "videoMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Video},
                sId: peerId
            }),
            "voiceMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Voice},
                sId: peerId
            }),
            "callMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call},
                sId: peerId
            }),
            "voiceCallMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call},
                sId: peerId,
                "msgAtt.withVideo":{$eq:false}
            }),
            "videoCallMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call},
                sId: peerId,
                "msgAtt.withVideo":{$eq:true}
            }),
            "fileMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.File},
                sId: peerId
            }),
            "infoMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Info},
                sId: peerId
            }),
            "locationMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Location},
                sId: peerId
            }),
            "allDeletedMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.AllDeleted},
                sId: peerId
            }),
        };
    }

    async getMessagesCounter() {
        return {
            "messages": await this.messageService.findCount(),
            "textMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Text}
            }),
            "imageMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Image}
            }),
            "videoMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Video}
            }),
            "voiceMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Voice}
            }),
            "fileMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.File}
            }),
            "infoMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Info}
            }),
            "callMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call}
            }),
            "voiceCallMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call},
                "msgAtt.withVideo":{$eq:false}
            }),
            "videoCallMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Call},
                "msgAtt.withVideo":{$eq:true}
            }),
            "locationMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.Location}
            }),
            "allDeletedMessages": await this.messageService.findCount({
                mT: {$eq: MessageType.AllDeleted}
            }),
        }
    }
}