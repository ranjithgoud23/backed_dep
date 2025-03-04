/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {SocketIoService} from './socket_io.service';
import {SocketIoGateway} from './socket_io.gateway';
import {CallMemberModule} from "../call_modules/call_member/call_member.module";
import { UserModule } from "../../api/user_modules/user/user.module";
import { RoomMemberModule } from "../room_member/room_member.module";
import { AuthModule } from "../../api/auth/auth.module";
import { MessageModule } from "../message/message.module";
import { RoomMiddlewareModule } from "../room_middleware/room_middleware.module";
import {UserDeviceModule} from "../../api/user_modules/user_device/user_device.module";
import {CallHistoryModule} from "../call_modules/call_history/call_history.module";

@Module({
    providers: [SocketIoGateway, SocketIoService],
    imports: [
        UserModule,
        RoomMemberModule,
        AuthModule,
        MessageModule,
        RoomMiddlewareModule,
        CallHistoryModule,
        CallMemberModule,
        UserDeviceModule,
    ],
    exports: [SocketIoService],
})
export class SocketIoModule {
}
