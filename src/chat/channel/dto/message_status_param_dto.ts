/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */


import {IsEnum} from "class-validator";
import { RoomIdAndMsgIdDto } from "../../../core/common/dto/room.id.and.msg.id.dto";
import { MessageStatusType } from "../../../core/utils/enums";

export class MessageStatusParamDto extends  RoomIdAndMsgIdDto{
    @IsEnum(MessageStatusType)
    type: MessageStatusType
}