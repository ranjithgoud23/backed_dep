/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {GroupMessageStatusService} from './group_message_status.service';
import {MongooseModule} from "@nestjs/mongoose";
import {GroupMessageStatusSchema} from "./entities/group_message_status.entity";

@Module({
    providers: [GroupMessageStatusService],
    exports: [GroupMessageStatusService],
    imports: [
        MongooseModule.forFeature([{
            name: "group_message_status",
            schema: GroupMessageStatusSchema
        }]),
    ]
})
export class GroupMessageStatusModule {
}
