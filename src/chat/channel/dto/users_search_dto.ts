/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow} from "class-validator";
import {remove} from "remove-accents";
import CommonDto from "../../../core/common/dto/common.dto";

export class UsersSearchDto extends CommonDto {
    @Allow()
    limit?: number

    @Allow()
    page?: number

    @Allow()
    fullName?: string

    @Allow()
    isAsc?: boolean

    getFilter(filterKey: string) {
        let filter = {}
        if (this.fullName) {
            filter[filterKey] = {
                "$regex": ".*" + remove(this.fullName) + ".*",
                "$options": "i"
            };
        }
        return filter
    }
}