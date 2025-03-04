/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { UserBanService } from './user_ban.service';
import { UserBanController } from './user_ban.controller';
import { BanModule } from "../../ban/ban.module";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../../auth/auth.module";
import { SocketIoModule } from "../../../chat/socket_io/socket_io.module";
import { RoomMemberModule } from "../../../chat/room_member/room_member.module";
import { RoomMiddlewareModule } from "../../../chat/room_middleware/room_middleware.module";

@Module({
  controllers: [UserBanController],
  providers: [UserBanService],
  imports:[
    BanModule,
    UserModule,
    AuthModule,
    SocketIoModule,
    RoomMemberModule,
    RoomMiddlewareModule
  ],
  exports: [UserBanService]
})
export class UserBanModule {}
