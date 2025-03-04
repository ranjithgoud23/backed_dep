/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { GroupSettingsService } from './group_settings.service';
import {MongooseModule} from "@nestjs/mongoose";
import {GroupSettingSchema} from "./entities/group_setting.entity";

@Module({
    providers: [GroupSettingsService],
    exports: [GroupSettingsService],
    imports:[
        MongooseModule.forFeature([{
            name: "group_settings",
            schema: GroupSettingSchema
        }]),
    ]
})
export class GroupSettingsModule {}
