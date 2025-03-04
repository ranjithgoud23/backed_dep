/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    IsNumber,
    IsSemVer,
} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";

// import CommonDto from "../../../core/common/common.dto";

export default class CheckVersionDto extends CommonDto {
    @IsSemVer()
    semVer: string;
}