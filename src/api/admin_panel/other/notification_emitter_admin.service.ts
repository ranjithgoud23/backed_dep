/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {NotificationEmitterService} from "../../../common/notification_emitter/notification_emitter.service";
import {CreateAdminNotificationDto} from "../../admin_notification/dto/create-admin_notification.dto";

@Injectable()
export class NotificationEmitterAdminService {
    constructor(readonly notificationEmitterService: NotificationEmitterService) {
    }


    async emitNotification(dto: CreateAdminNotificationDto) {
        await this.notificationEmitterService.adminNotification(dto.title, dto.content)
    }
}
