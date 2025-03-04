/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {MeetMemberSchema} from "./entities/call_member.entity";
import {CallMemberService} from "./call_member.service";

@Module({
    providers: [CallMemberService],
    exports: [CallMemberService],
    imports: [
        MongooseModule.forFeature([{
            name: "meet_member",
            schema: MeetMemberSchema
        }]),
    ]
})
export class CallMemberModule {
}
