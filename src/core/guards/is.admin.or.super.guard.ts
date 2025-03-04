/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";


@Injectable()
export class IsSuperAdminGuard implements CanActivate {
    constructor(
        readonly config: ConfigService
    ) {
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        let password = this.config.getOrThrow("ControlPanelAdminPassword").toString()
        let passwordViewer = this.config.getOrThrow("ControlPanelAdminPasswordViewer")
        const request = context.switchToHttp().getRequest();
        const userPassword = request.headers["admin-key"].toString();
        if (userPassword != password && userPassword != passwordViewer) {
            throw new BadRequestException("admin-key header should be valid as on the .env")
        }
        request['isViewer'] = userPassword == passwordViewer;

        return true;
    }
}