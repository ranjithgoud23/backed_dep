/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    Allow, IsEmail,

    IsEnum,
    IsNotEmpty,
    MaxLength,
    MinLength, ValidateIf,
} from "class-validator";
import {Trim} from 'class-sanitizer'
import {usersMaxNameSize, usersMaxPasswordSize, usersMimePasswordSize} from "../../../core/utils/constants";
import {Platform, RegisterMethod} from "../../../core/utils/enums";
import {i18nApi} from "../../../core/utils/res.helpers";


export default class RegisterDto {
    ip: string;
    imageBuffer?: Buffer;

    @Allow()
    @Trim()
    @ValidateIf(object => object['method'] == RegisterMethod.email)
    @IsEmail({}, {message: i18nApi.emailMustBeValid})
    email: string;

    @IsNotEmpty()
    @Trim()
    @MaxLength(usersMaxNameSize)
    fullName: string;


    @IsNotEmpty()
    @Trim()
    @MaxLength(255)
    deviceId: string;


    @Allow()
    @Trim()
    pushKey?: string;


    @IsNotEmpty()
    language: string;

    @IsNotEmpty()
    deviceInfo: string;

    @IsEnum(RegisterMethod)
    method: RegisterMethod;

    @IsEnum(Platform)
    platform: Platform;


    @MaxLength(usersMaxPasswordSize)
    @MinLength(usersMimePasswordSize)
    @IsNotEmpty()
    password: string;
}