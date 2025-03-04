/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow, IsBoolean, IsBooleanString, IsEnum, IsNotEmpty} from "class-validator";
import CommonDto from "../../../../core/common/dto/common.dto";
import {MeetPlatform} from "../../../../core/utils/enums";

export class CreateCallMemberDto extends CommonDto {

    @Allow()
    payload: any

    roomId: string

    @IsBoolean()
    withVideo: boolean

    @IsEnum(MeetPlatform)
    meetPlatform: MeetPlatform

}
