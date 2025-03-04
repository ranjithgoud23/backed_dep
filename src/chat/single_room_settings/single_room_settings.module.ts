/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {SingleRoomSettingsService} from './single_room_settings.service';
import {MongooseModule} from "@nestjs/mongoose";
import {SingleRoomSettings} from "./entities/single_room_setting.entity";

@Module({
    providers: [SingleRoomSettingsService],
    exports:[SingleRoomSettingsService],
    imports: [
        MongooseModule.forFeature([{
            name: "single_room_settings",
            schema: SingleRoomSettings
        }]),
    ]
})
export class SingleRoomSettingsModule {
}
