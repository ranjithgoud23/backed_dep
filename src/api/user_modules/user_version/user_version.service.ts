/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { BadRequestException, Injectable } from "@nestjs/common";
import CheckVersionDto from "../../profile/dto/check-version.dto";
import { UserDeviceService } from "../user_device/user_device.service";
import { VersionsService } from "../../versions/versions.service";
import semver from "semver/preload";

@Injectable()
export class UserVersionService {

  constructor(
    private versionsService: VersionsService,
    private userDevice: UserDeviceService
  ) {
  }

  async checkVersion(dto: CheckVersionDto) {
    let clientSemVer = dto.semVer.split("+")[0];
    let latestVersion = await this.versionsService.findOne({
      platform: dto.myUser.currentDevice.platform
    }, null, { sort: "-_id" });
    if (!latestVersion) {
      throw new BadRequestException("latestVersion not found");
    }
    let serverSemVer = latestVersion.semVer;
    let isBigger = semver.gt(clientSemVer, serverSemVer);
    //let isSmall = semver.lt(clientSemVer, serverSemVer)
    let isEqu = serverSemVer === clientSemVer;
    let res = {
      isNeedUpdates: false,
      isCritical: latestVersion.critical,
      clientVersion: dto.semVer,
      notes: latestVersion.notes,
      serverVersion: latestVersion.semVer,
      platform: latestVersion.platform
    };
    if (isBigger || isEqu) {
      return res;
    }
    // set version to this user
    await this.userDevice.findByIdAndUpdate(dto.myUser.currentDevice._id, {
      clintVersion: clientSemVer
    });
    return {
      ...res,
      isNeedUpdates: true
    };
  }
}
