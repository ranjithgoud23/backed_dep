/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IsDefined, IsEmail, IsNotEmpty, IsNumberString, MaxLength} from "class-validator";
// import CommonDto from "../../../core/common/common.dto";

export default class ResetPasswordDto   {



    @IsEmail( {},{message:"Email is required and must be email format"})
    @MaxLength(200)
    email: string;

    @IsNotEmpty()
    newPassword: string;

    @IsNotEmpty()
    @IsNumberString()
    @MaxLength(6)
    code: number;


}