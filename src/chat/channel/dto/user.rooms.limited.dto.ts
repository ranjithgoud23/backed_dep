/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

 import {Allow, IsNumberString, ValidateIf} from "class-validator";
 import CommonDto from "../../../core/common/dto/common.dto";

export class UserRoomsLimitedDto extends CommonDto {
    @Allow()
    @ValidateIf(object => object['page'])
    @IsNumberString()
    page?: string

    @Allow()
    @ValidateIf(object => object['limit'])
    @IsNumberString()
    limit?: string
}