/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "./common.dto";
import { Allow, IsMongoId, ValidateIf } from "class-validator";

export  class MongoLastIdDto extends CommonDto {

  @Allow()
  @ValidateIf((value) => value['lastId'] !== undefined)
  @IsMongoId()
  lastId?: string;
}