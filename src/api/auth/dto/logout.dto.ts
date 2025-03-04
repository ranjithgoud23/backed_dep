/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow, IsBoolean, IsDefined, IsEmail, IsNumberString, MaxLength, ValidateIf} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";
  // import CommonDto from "../../../core/common/common.dto";

export default class LogoutDto extends CommonDto {
    @Allow()
    @ValidateIf(object => object['logoutFromAll'] )
    @IsDefined()
    password: string;

    @IsBoolean()
    logoutFromAll: boolean;
}