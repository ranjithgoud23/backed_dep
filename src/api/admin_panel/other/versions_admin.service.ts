/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from '@nestjs/common';
import {VersionsService} from "../../versions/versions.service";
import {CreateNewVersionDto, GetVersionDto} from "../dto/admin_dto";
import semver from "semver/preload";
import {MongoIdDto} from "../../../core/common/dto/mongo.id.dto";

@Injectable()
export class VersionsAdminService {
    constructor(readonly versionsService: VersionsService,) {
    }
    async setNewVersion(dto: CreateNewVersionDto) {
        //await  this._firstInit()
        let v = await this.versionsService.findOne({
            semVer: dto.semVer,
            platform: dto.platform
        });
        if (v) throw new BadRequestException("Version already exists!");
        let last = await this.versionsService.findOne({
            platform: dto.platform
        }, null, {sort: "-_id"});
        let isSmall = semver.lt(dto.semVer, last.semVer);
        if (isSmall) {
            throw new BadRequestException("the new version must bigger than the last version " + last.semVer);
        }
        if (dto.notify) {
            //todo notify
        }
        await this.versionsService.create({
            semVer: dto.semVer,
            notes: dto.notes,
            platform: dto.platform,
            critical: dto.critical,
            notify: dto.notify
        });
        return "Updated";
    }

    async getVersions(platform: GetVersionDto) {
        return this.versionsService.findAll({
            platform: platform.platform
        }, null, {
            sort: "-_id"
        });
    }

    async deleteVersion(id: MongoIdDto) {
        await this.versionsService.findByIdAndDelete(id.id);
        return "deleted";
    }
}
