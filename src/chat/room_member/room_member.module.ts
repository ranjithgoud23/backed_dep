/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {  Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {RoomMemberService} from "./room_member.service";
import {RoomMemberSchema} from "./entities/room_member.entity";
import { UserModule } from "../../api/user_modules/user/user.module";

@Module({
    providers: [RoomMemberService],
    imports: [
        MongooseModule.forFeature([{
            name: "room_member",
            schema: RoomMemberSchema
        }]),
        UserModule,
    ],
    exports: [RoomMemberService]
})
export class RoomMemberModule {
}
