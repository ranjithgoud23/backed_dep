/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from "@nestjs/common";
import {CallService} from "./call.service";
import {CallController} from "./call.controller";
import {RoomMiddlewareModule} from "../../room_middleware/room_middleware.module";
import {SocketIoModule} from "../../socket_io/socket_io.module";
import {CallMemberModule} from "../call_member/call_member.module";
import {AppConfigModule} from "../../../api/app_config/app_config.module";
import {UserModule} from "../../../api/user_modules/user/user.module";
import {AuthModule} from "../../../api/auth/auth.module";
import {NotificationEmitterModule} from "../../../common/notification_emitter/notification_emitter.module";
import {UserBanModule} from "../../../api/user_modules/user_ban/user_ban.module";
import {MessageModule} from "../../message/message.module";
import {CallEmitter} from "./call_emitter";
import {UserDeviceModule} from "../../../api/user_modules/user_device/user_device.module";
import {AgoraModule} from "../../agora/agora.module";
import {GroupMemberModule} from "../../group_member/group_member.module";
import {CallHistoryModule} from "../call_history/call_history.module";
import {RoomMemberModule} from "../../room_member/room_member.module";

@Module({
    controllers: [CallController],
    providers: [CallService, CallEmitter],
    exports: [CallService],
    imports: [
        UserModule,
        AuthModule,
        RoomMiddlewareModule,
        UserBanModule,
        NotificationEmitterModule,
        SocketIoModule,
        MessageModule,
        CallMemberModule,
        AppConfigModule,
        UserDeviceModule,
        AgoraModule,
        GroupMemberModule,
        CallHistoryModule,
        RoomMemberModule,
    ]
})
export class CallModule {
}
