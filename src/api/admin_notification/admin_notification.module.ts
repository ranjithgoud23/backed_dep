/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { AdminNotificationService } from "./admin_notification.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminNotificationSchema } from "./entities/admin_notification.entity";

@Module({
  providers: [AdminNotificationService],
  exports: [AdminNotificationService],
  imports: [
    MongooseModule.forFeature([{
      name: "admin_notification",
      schema: AdminNotificationSchema
    }])
  ]
})
export class AdminNotificationModule {
}
