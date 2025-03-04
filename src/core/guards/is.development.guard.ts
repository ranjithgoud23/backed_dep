/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, CanActivate, ExecutionContext, BadRequestException} from "@nestjs/common";
@Injectable()
export class IsDevelopmentGuard implements CanActivate {
    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
       return  process.env.NODE_ENV == "development"

    }
}
