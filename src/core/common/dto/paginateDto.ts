/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    Allow,
    IsEnum, IsISO8601,
    IsMongoId,
    IsNumberString,
    ValidateIf
} from "class-validator";
 import {BadRequestException} from "@nestjs/common";
import CommonDto from "./common.dto";

export class DefaultPaginateParams extends  CommonDto{
    @Allow()
    limit?: string

    @Allow()
    page?: string


    getLimit() {
        let limit = this.limit ? parseInt(this.limit) : 20;
        if (limit <= 0) {
            throw new BadRequestException("limit must bigger than 0")
        }
        return limit
    }

    getPage() {
        let page = this.page ? parseInt(this.page) : 1;
        if (parseInt(this.page) <= 0) {
            throw new BadRequestException("page must bigger than 0")
        }
        return page
    }
}

