/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';

import {UserModule} from "../../api/user_modules/user/user.module";
import {MessageModule} from "../message/message.module";
import {RoomMemberModule} from "../room_member/room_member.module";
import {SocketIoModule} from "../socket_io/socket_io.module";
import {FileUploaderModule} from "../../common/file_uploader/file_uploader.module";
import {AuthModule} from "../../api/auth/auth.module";
import {NotificationEmitterModule} from "../../common/notification_emitter/notification_emitter.module";
import {SingleRoomSettingsModule} from "../single_room_settings/single_room_settings.module";
import {GroupSettingsModule} from "../group_settings/group_settings.module";
import {BroadcastSettingsModule} from "../broadcast_settings/broadcast_settings.module";
import {GroupMemberModule} from "../group_member/group_member.module";
import {BroadcastMemberModule} from "../broadcast_member/broadcast_member.module";
import {RoomMiddlewareModule} from "../room_middleware/room_middleware.module";
import {AppConfigModule} from "../../api/app_config/app_config.module";
import {GroupMessageStatusModule} from "../group_message_status/group_message_status.module";
import {UserBanModule} from "../../api/user_modules/user_ban/user_ban.module";
import {OrderRoomSettingsModule} from "../order_room_settings/order_room_settings.module";
import {GroupChannelController} from "./controllers/group.channel.controller";
import {BroadcastChannelController} from "./controllers/broadcast.channel.controller";
import {MessageChannelController} from "./controllers/message.channel.controller";
import {GroupChannelService} from "./services/group.channel.service";
import {BroadcastChannelService} from "./services/broadcast.channel.service";
import {MessageChannelService} from "./services/message.channel.service";
import {ChannelService} from "./services/channel.service";
import {ChannelController} from "./controllers/channel.controller";
import {NotificationEmitterChannelService} from "./services/notification_emitter_channel.service";
import {UserDeviceModule} from "../../api/user_modules/user_device/user_device.module";

@Module({
    controllers: [
        ChannelController,
        GroupChannelController,
        BroadcastChannelController,
        MessageChannelController,
    ],
    providers: [
        ChannelService,
        GroupChannelService,
        BroadcastChannelService,
        MessageChannelService,
        NotificationEmitterChannelService
    ],
    imports: [
        UserModule,
        MessageModule,
        RoomMemberModule,
        SocketIoModule,
        FileUploaderModule,
        AuthModule,
        NotificationEmitterModule,
        SingleRoomSettingsModule,
        GroupSettingsModule,
        BroadcastSettingsModule,
        GroupMemberModule,
        BroadcastMemberModule,
        RoomMiddlewareModule,
        AppConfigModule,
        GroupMessageStatusModule,
        UserBanModule,
        OrderRoomSettingsModule,
        UserDeviceModule
    ],
    exports: [
        ChannelService
    ]
})
export class ChannelModule {
}
