/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {UserDeviceService} from './user_device.service';
import {MongooseModule} from "@nestjs/mongoose";
import {UserDeviceSchema} from "./entities/user_device.entity";

@Module({
    providers: [UserDeviceService],
    exports: [UserDeviceService],
    imports: [
        MongooseModule.forFeature([{
            name: "user_device",
            schema: UserDeviceSchema
        }]),

    ]
})
export class UserDeviceModule {
}
