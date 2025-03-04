/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow, IsNotEmpty} from "class-validator";
import CommonDto from "../../../../core/common/dto/common.dto";

export class GetAgoraAccessDto extends CommonDto {
    @Allow()
    cha: any
    meetId: string
}
