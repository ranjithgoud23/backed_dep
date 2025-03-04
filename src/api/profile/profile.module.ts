/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from "@nestjs/common";
import {ProfileService} from "./profile.service";
import {ProfileController} from "./profile.controller";
import {UserModule} from "../user_modules/user/user.module";
import {UserDeviceModule} from "../user_modules/user_device/user_device.module";
import {AuthModule} from "../auth/auth.module";
import {VersionsModule} from "../versions/versions.module";
import {FileUploaderModule} from "../../common/file_uploader/file_uploader.module";
import {UserBanModule} from "../user_modules/user_ban/user_ban.module";
import {AppConfigModule} from "../app_config/app_config.module";
import {AdminNotificationModule} from "../admin_notification/admin_notification.module";
import {GroupMemberModule} from "../../chat/group_member/group_member.module";
import {BroadcastMemberModule} from "../../chat/broadcast_member/broadcast_member.module";
import {RoomMemberModule} from "../../chat/room_member/room_member.module";
import {UserVersionModule} from "../user_modules/user_version/user_version.module";
import {ReportSystemModule} from "../report_system/report_system.module";
import {SocketIoModule} from "../../chat/socket_io/socket_io.module";
import {BanModule} from "../ban/ban.module";
import {NotificationEmitterModule} from "../../common/notification_emitter/notification_emitter.module";
import {ChatRequestModule} from "../../chat/chat_request/chat_request.module";
import {ChannelModule} from "../../chat/channel/channel.module";
import {ProfileNotificationEmitter} from "./profile_notification_emitter";

@Module({
    controllers: [ProfileController],
    providers: [ProfileService,ProfileNotificationEmitter],
    exports: [ProfileService],
    imports: [
        UserModule,
        FileUploaderModule,
        UserBanModule,
        AuthModule,
        UserDeviceModule,
        VersionsModule,
        AppConfigModule,
        AdminNotificationModule,
        GroupMemberModule,
        BroadcastMemberModule,
        RoomMemberModule,
        UserVersionModule,
        ReportSystemModule,
        SocketIoModule,
        NotificationEmitterModule,
        ChatRequestModule,
        ChannelModule

    ]
})
export class ProfileModule {
}
