/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { IsEnum, IsMongoId } from "class-validator";
import { RoomIdAndMsgIdDto } from "../../../core/common/dto/room.id.and.msg.id.dto";
import { DeleteMessageType } from "../../../core/utils/enums";


export class DeleteMessageDto extends RoomIdAndMsgIdDto {
  @IsEnum(DeleteMessageType)
  type: string;
}