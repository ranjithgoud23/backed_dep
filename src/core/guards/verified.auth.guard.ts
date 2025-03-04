/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, CanActivate, ExecutionContext, BadRequestException} from "@nestjs/common";
import { AuthService } from "../../api/auth/auth.service";

@Injectable()
export class VerifiedAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {
    }

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers["authorization"] || request.headers["Authorization"];
        if (!authorization) throw new BadRequestException("authorization key in headers is required");
        if (!authorization.toString().includes("Bearer"))
            throw new BadRequestException("authorization key in headers is must start with Bearer");
        let token = authorization.split("Bearer ")[1];
        if (!token) throw new BadRequestException("Token after Bearer\" \"must be starting ");
        request.user = await this.authService.getVerifiedUser(token);
        return true;
    }
}