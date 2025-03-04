/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "../../../core/common/dto/common.dto";
import { IsEnum, IsString } from "class-validator";

export class CreateAdminNotificationDto extends CommonDto {
  imageBuffer?: Buffer;
  @IsString()
  content: string;

  @IsString()
  title: string;

  imageUrl?:string

}
