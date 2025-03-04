/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IsDefined, IsEmail, IsNotEmpty, IsNumber, IsNumberString, MaxLength} from "class-validator";
 import {Trim} from "class-sanitizer";

export default class ValidateEmailDto {

  @IsEmail( {},{message:"Email is required and must be email format"})
  @Trim()
  @MaxLength(200)
  email: string;


  @IsNotEmpty()
  @IsNumber()
  @Trim()
  code: number;

}