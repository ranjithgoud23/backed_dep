/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { GroupMemberService } from './group_member.service';
import {MongooseModule} from "@nestjs/mongoose";
import {GroupMemberSchema} from "./entities/group_member.entity";

@Module({
    providers: [GroupMemberService],
    exports: [GroupMemberService],
    imports:[
        MongooseModule.forFeature([{
            name: "group_member",
            schema: GroupMemberSchema
        }]),
    ]
})
export class GroupMemberModule {}
