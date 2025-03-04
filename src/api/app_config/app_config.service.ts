/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {IAppConfig} from "./entities/app_config.entity";
import {ConfigService} from "@nestjs/config";

import {UserService} from "../user_modules/user/user.service";
import {CreateNewVersionDto} from "../admin_panel/dto/admin_dto";
import semver from "semver/preload";

@Injectable()
export class AppConfigService {

    constructor(
        @InjectModel("app_config") private readonly appConfig: Model<IAppConfig>,
        private readonly config: ConfigService,
        private readonly userService: UserService
    ) {

    }

    async getConfig(): Promise<IAppConfig> {
        return this.appConfig.findOne().sort("-_id");
    }

    async insert(data: Partial<IAppConfig>) {
        return this.appConfig.create(data);
    }

}
