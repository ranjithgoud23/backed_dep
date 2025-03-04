/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { NotificationEmitterService } from "./notification_emitter.service";
import { UserDeviceModule } from "../../api/user_modules/user_device/user_device.module";
import { UserModule } from "../../api/user_modules/user/user.module";
import { NotificationEvent } from "./notification.event";
import { RoomMiddlewareModule } from "../../chat/room_middleware/room_middleware.module";
import { RoomMemberModule } from "../../chat/room_member/room_member.module";
import { GroupMemberModule } from "../../chat/group_member/group_member.module";
import { BroadcastMemberModule } from "../../chat/broadcast_member/broadcast_member.module";

@Module({
  providers: [NotificationEvent,NotificationEmitterService],
  exports: [NotificationEmitterService],
  imports: [
    UserModule,
      UserDeviceModule,
  ]
})
export class NotificationEmitterModule {
}
