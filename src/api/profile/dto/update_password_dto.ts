/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import "reflect-metadata";
import {Allow, IsBoolean, IsDefined, IsNotEmpty, MaxLength, MinLength, ValidateIf} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";
import { usersMaxPasswordSize, usersMimePasswordSize } from "../../../core/utils/constants";

export default class UpdatePasswordDto extends CommonDto {

    @IsNotEmpty()
    oldPassword?: string;


    @MaxLength(usersMaxPasswordSize)
    @MinLength(usersMimePasswordSize)
    @IsNotEmpty()
    newPassword?: string;

    @IsBoolean()
    logoutFromAll: boolean
}
