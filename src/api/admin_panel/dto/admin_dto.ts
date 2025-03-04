/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { MongoIdDto } from "../../../core/common/dto/mongo.id.dto";
import { Allow, IsBoolean, IsDateString, IsEnum, IsSemVer } from "class-validator";
import { Platform } from "../../../core/utils/enums";
import CommonDto from "../../../core/common/dto/common.dto";

export class BanToDto extends MongoIdDto {
  @IsDateString()
  banTo: string;
}


export class CreateNewVersionDto {

  @IsSemVer()
  semVer: string;


  @IsBoolean()
  notify: boolean;

  @Allow()
  notes: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsBoolean()
  critical: boolean;
}

export class GetVersionDto extends CommonDto {

  @IsEnum(Platform)
  platform: Platform;
}