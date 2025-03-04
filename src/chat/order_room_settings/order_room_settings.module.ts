/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {OrderRoomSettingsService} from './single_room_settings.service';
import {MongooseModule} from "@nestjs/mongoose";
import {OrderRoomSettings} from "./entities/order_room_setting.entity";

@Module({
    providers: [OrderRoomSettingsService],
    exports:[OrderRoomSettingsService],
    imports: [
        MongooseModule.forFeature([{
            name: "order_room_settings",
            schema: OrderRoomSettings
        }]),
    ]
})
export class OrderRoomSettingsModule {
}
