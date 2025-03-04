/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (request.clientIp)
    return request.clientIp;
  return requestIp.getClientIp(request);
});