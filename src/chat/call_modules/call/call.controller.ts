/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query} from '@nestjs/common';

import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {resOK} from "../../../core/utils/res.helpers";

import {CreateCallMemberDto} from "./dto/create-call_member.dto";
import {AcceptCallMemberDto} from "./dto/accept-call_member.dto";
import {CallService} from "./call.service";

import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {MongoIdDto} from "../../../core/common/dto/mongo.id.dto";
import {MongoCallIdDto} from "../../../core/common/dto/mongo.call.id.dto";

@UseGuards(VerifiedAuthGuard)
@V1Controller('call')
export class CallController {
    constructor(private readonly callService: CallService) {
    }



    @Post('/create/:roomId')
    async createCall(
        @Req() req: any,
        @Param() roomIdDto: MongoRoomIdDto,
        @Body() dto: CreateCallMemberDto,
    ) {
        dto.myUser = req.user;
        dto.roomId = roomIdDto.roomId
        return resOK(await this.callService.createCall(dto))
    }



    @Get('/active')
    async getRingCall(@Req() req: any) {
        return resOK(await this.callService.getRingCall(req.user._id))
    }

    @Get('/agora-access/:roomId')
    async getAgoraAccess(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.callService.getAgoraAccess(dto))
    }



    @Post('/accept/:callId')
    async acceptCall(
        @Req() req: any,
        @Param() meetIdDto: MongoCallIdDto,
        @Body() dto: AcceptCallMemberDto
    ) {
        dto.myUser = req.user;
        dto.callId = meetIdDto.callId
        return resOK(await this.callService.acceptCall(dto))
    }



    @Post('/end/v2/:callId')
    async endCallV2(@Req() req: any, @Param() dto: MongoCallIdDto) {
        dto.myUser = req.user;
        return resOK(await this.callService.endCallV2(dto))
    }

    @Get("/history")
    async getCallsHistory(@Req() req: any) {
        return resOK(await this.callService.getCallsHistory(req.user));
    }

    @Delete("/history/clear")
    async deleteAllHistory(@Req() req: any) {
        return resOK(await this.callService.deleteAllHistory(req.user));
    }

    @Delete("/history/clear/:id")
    async deleteOneHistory(@Req() req: any, @Param() dto: MongoIdDto) {
        dto.myUser = req.user
        return resOK(await this.callService.deleteOneHistory(dto));
    }
}
