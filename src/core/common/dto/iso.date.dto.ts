/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "./common.dto";
import {IsISO8601, IsMongoId} from "class-validator";

export class IsIsoDateDto extends CommonDto {

    @IsISO8601()
    date: Date;
}