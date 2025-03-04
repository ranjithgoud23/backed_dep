/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from "@nestjs/common";
import { UserVersionService } from './user_version.service';
import CheckVersionDto from "../../profile/dto/check-version.dto";
import { resOK } from "../../../core/utils/res.helpers";
import { V1Controller } from "../../../core/common/v1-controller.decorator";
import { VerifiedAuthGuard } from "../../../core/guards/verified.auth.guard";


@V1Controller('user-version')
@UseGuards(VerifiedAuthGuard)
export class UserVersionController {
  constructor(private readonly userVersionService: UserVersionService) {}
  @Patch("/")
  async checkVersion(@Req() req:any, @Body() dto: CheckVersionDto) {
    dto.myUser = req.user;
    return resOK(await this.userVersionService.checkVersion(dto));
  }
}
