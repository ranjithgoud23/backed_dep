/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {createParamDecorator, ExecutionContext} from "@nestjs/common";



export const IsDevelopment = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return process.env.NODE_ENV == "development"

});