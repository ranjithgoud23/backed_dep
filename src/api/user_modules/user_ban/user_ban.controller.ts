/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import { UserBanService } from './user_ban.service';
import { VerifiedAuthGuard } from "../../../core/guards/verified.auth.guard";
import { MongoPeerIdDto } from "../../../core/common/dto/mongo.peer.id.dto";
import { resOK } from "../../../core/utils/res.helpers";
import { V1Controller } from "../../../core/common/v1-controller.decorator";

@UseGuards(VerifiedAuthGuard)
@V1Controller('user-ban')
export class UserBanController {
  constructor(private readonly userBanService: UserBanService) {
  }

  @Post('/:peerId/ban')
  async ban(@Param() dto: MongoPeerIdDto, @Req() req:any) {
    dto.myUser = req.user;
    return resOK(await this.userBanService.ban(dto));
  }
  @Get('/:peerId/ban')
  async checkBans(@Param() dto: MongoPeerIdDto, @Req() req:any) {
    dto.myUser = req.user;
    return resOK(await this.userBanService.checkBans(dto));
  }

  @Post('/:peerId/un-ban')
  async unBan(@Param() dto: MongoPeerIdDto, @Req() req:any) {
    dto.myUser = req.user;
    return resOK(await this.userBanService.unBan(dto));
  }

}
