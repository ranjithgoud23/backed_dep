/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { BroadcastSettingsService } from './broadcast_settings.service';
import {MongooseModule} from "@nestjs/mongoose";
import {BroadcastSettingSchema} from "./entities/broadcast_setting.entity";

@Module({
    providers: [BroadcastSettingsService],
    exports: [BroadcastSettingsService],
    imports:[
        MongooseModule.forFeature([{
            name: "broadcast_settings",
            schema: BroadcastSettingSchema
        }]),
    ]
})
export class BroadcastSettingsModule {}
