/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const RequestLang = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  const l = request.headers["accept-language"];
  if (l)
    return l;
  return "en";
});

export const RequestTest = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  console.log(request.body)
  return true
});