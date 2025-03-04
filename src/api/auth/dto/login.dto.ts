/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow, IsEmail, IsEnum, IsNotEmpty, MaxLength, ValidateIf} from "class-validator";
import {Trim} from "class-sanitizer";
import { Platform, RegisterMethod } from "../../../core/utils/enums";

export default class LoginDto {

    @IsEnum(Platform)
    platform: Platform;


    ip: string;

    @Allow()
    @ValidateIf(object => object['registerMethod'] == RegisterMethod.email)
    @IsEmail({}, {message: "Email is required and must be email format"})
    @Trim()
    email: string;

    @IsEnum(RegisterMethod)
    method: RegisterMethod;
    @IsNotEmpty()
    @MaxLength(255)
    password: string;

    @Allow()
    @Trim()
    pushKey?: string;

    @IsNotEmpty()
    language: string;


    @IsNotEmpty()
    deviceInfo: any;

    @IsNotEmpty()
    @Trim()
    @MaxLength(255)
    deviceId: string;
}