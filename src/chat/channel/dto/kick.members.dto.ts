/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

 import {Allow, IsMongoId, IsNotEmpty, ValidateIf} from "class-validator";
 import { MongoRoomIdDto } from "../../../core/common/dto/mongo.room.id.dto";



export class KickMembersDto extends MongoRoomIdDto {


    @IsNotEmpty()
    peerId: string;

}