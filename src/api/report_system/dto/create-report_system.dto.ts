/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "../../../core/common/dto/common.dto";
import {IsMongoId, IsNotEmpty} from "class-validator";

export class CreateReportSystemDto extends CommonDto {
    @IsNotEmpty()
    content: string
    @IsNotEmpty()
    type: string

    @IsMongoId()
    targetId: string
}
