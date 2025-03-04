/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IsBoolean} from "class-validator";

export class MuteDto {
    @IsBoolean()
    isMuted: string
}