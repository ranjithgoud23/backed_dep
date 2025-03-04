/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { BroadcastMemberService } from './broadcast_member.service';
import {MongooseModule} from "@nestjs/mongoose";
import {BroadcastMemberSchema} from "./entities/broadcast_member.entity";

@Module({
    providers: [BroadcastMemberService],
    exports: [BroadcastMemberService],
    imports:[
        MongooseModule.forFeature([{
            name: "broadcast_member",
            schema: BroadcastMemberSchema
        }]),
    ]
})
export class BroadcastMemberModule {}
