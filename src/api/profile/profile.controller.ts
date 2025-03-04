/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    Controller,
    Get,
    UseGuards,
    Req,
    Param,
    Patch,
    Body,
    UseInterceptors,
    BadRequestException, UploadedFile, Post, Query, Delete, Version
} from "@nestjs/common";
import {ProfileService} from "./profile.service";

import {
    UpdateChatReqStatusDto,
    UpdateMyBioDto,
    UpdateMyNameDto,
    UpdateMyPasswordDto,
    UpdateMyPrivacyDto
} from "./dto/update.my.name.dto";
import UpdatePasswordDto from "./dto/update_password_dto";
import {VerifiedAuthGuard} from "../../core/guards/verified.auth.guard";
import {resOK} from "../../core/utils/res.helpers";
import {imageFileInterceptor} from "../../core/utils/upload_interceptors";
import {MongoIdDto} from "../../core/common/dto/mongo.id.dto";
import CheckVersionDto from "./dto/check-version.dto";
import {V1Controller} from "../../core/common/v1-controller.decorator";
import {MongoPeerIdDto} from "../../core/common/dto/mongo.peer.id.dto";
import {CreateReportSystemDto} from "../report_system/dto/create-report_system.dto";


@V1Controller("profile")
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {
    }


    @UseGuards(VerifiedAuthGuard)
    @Get("/")
    async getMyProfile(@Req() req: any) {
        return resOK(await this.profileService.getMyProfile(req.user));
    }


    @Get("/app-config")
    async getConfig(@Req() req: any) {
        return resOK(await this.profileService.getAppConfig(req.user));
    }

    @UseGuards(VerifiedAuthGuard)
    @Get("/users")
    async getUsersAndSearch(@Req() req: any, @Query() dto: Object) {
        return resOK(await this.profileService.getUsersAndSearch(dto, req.user));
    }

    @UseGuards(VerifiedAuthGuard)
    @Get("/admin-notifications")
    async getAdminNotification(@Req() req: any, @Query() dto: Object) {
        return resOK(await this.profileService.getAdminNotification(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Get("/device")
    async getMyDevice(@Req() req: any) {
        return resOK(await this.profileService.getMyDevices(req.user));
    }

    @UseGuards(VerifiedAuthGuard)
    @Delete("/device/:id")
    async deleteDevice(
        @Req() req: any,
        @Param() dto: MongoIdDto,
        @Body('password') password: string
    ) {
        dto.myUser = req.user
        return resOK(await this.profileService.deleteDevice(dto, password));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/name")
    async updateMyName(@Req() req: any, @Body() dto: UpdateMyNameDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updateMyName(dto));
    }


    @UseGuards(VerifiedAuthGuard)
    @Patch("/privacy")
    async updateMyPrivacy(@Req() req: any, @Body() dto: UpdateMyPrivacyDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updateMyPrivacy(dto));
    }


    @UseGuards(VerifiedAuthGuard)
    @Get("/blocked")
    async getMyBlocked(@Req() req: any, @Query() dto: Object) {
        return resOK(await this.profileService.getMyBlocked(req.user, dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/bio")
    async updateMyBio(@Req() req: any, @Body() dto: UpdateMyBioDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updateMyBio(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/password")
    async updateMyPassword(@Req() req: any, @Body() dto: UpdateMyPasswordDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updateMyPassword(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @UseInterceptors(imageFileInterceptor)
    @Patch("/image")
    async updateMyImage(@Req() req: any, @UploadedFile() file?: any) {
        if (!file) {
            throw new BadRequestException("Image is required!");
        }
        return resOK(await this.profileService.updateMyImage(file, req.user));
    }
    @UseGuards(VerifiedAuthGuard)
    @Get("/chat-request")
    async getMyChatRequest(@Req() req: any,   @Query() dto: object) {
        return resOK(await this.profileService.getMyChatRequest(req.user,dto));
    }
    @UseGuards(VerifiedAuthGuard)
    @Get("/:id")
    async getPeerProfile(@Req() req: any, @Param() dto: MongoIdDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.getPeerProfile(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Post("/:id/chat-request")
    async sendChatRequest(@Req() req: any, @Param() dto: MongoIdDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.sendChatRequest(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/:id/chat-request")
    async updateChatRequest(
        @Req() req: any,
        @Param() dto: MongoIdDto,
        @Body( ) status: UpdateChatReqStatusDto
    ) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updateChatRequest(dto,status));
    }


    @UseGuards(VerifiedAuthGuard)
    @Delete("/push")
    async deleteFcm(@Req() req: any) {
        return resOK(await this.profileService.deleteFcmFor(req.user));
    }

    @UseGuards(VerifiedAuthGuard)
    @Post("/push")
    async addFcm(
        @Req() req: any,
        @Body("pushKey") pushKey?: string,
        @Body("voipKey") voipKey?: string,

    ) {
        if (!pushKey && !voipKey) {
            throw new BadRequestException("pushKey or voipKey is required");
        }
        return resOK(await this.profileService.addPushKey(req.user, pushKey, voipKey));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/push")
    async updateFcm(@Body("pushKey") pushKey: String, @Req() req: any) {
        if (!pushKey) {
            throw new BadRequestException("pushKey is required");
        }
        return resOK(await this.profileService.updateFcm(req.user, pushKey));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/lang")
    async updateLanguage(@Body("lang") lang: String, @Req() req: any) {
        if (!lang) {
            throw new BadRequestException("lang is required");
        }
        return resOK(await this.profileService.updateLanguage(req.user, lang));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/visit")
    async setVisit(@Req() req: any) {
        return resOK(await this.profileService.setVisit(req.user));
    }

    @UseGuards(VerifiedAuthGuard)
    @Get("/users/:peerId/last-seen")
    async getUserLastSeenAt(
        @Req() req: any,
        @Param() dto: MongoPeerIdDto,
    ) {
        dto.myUser = req.user
        return resOK(await this.profileService.getUserLastSeenAt(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/password")
    async updatePassword(@Body() dto: UpdatePasswordDto, @Req() req: any) {
        dto.myUser = req.user;
        return resOK(await this.profileService.updatePassword(req.user, dto));
    }


    @UseGuards(VerifiedAuthGuard)
    @Delete("/delete-my-account")
    async deleteMyAccount(@Req() req: any, @Body('password') password: string) {
        return resOK(await this.profileService.deleteMyAccount(req.user, password));
    }

    @UseGuards(VerifiedAuthGuard)
    @Patch("/version")
    async checkVersion(@Req() req: any, @Body() dto: CheckVersionDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.checkVersion(dto));
    }

    @UseGuards(VerifiedAuthGuard)
    @Post("/report")
    async createReport(@Req() req: any, @Body() dto: CreateReportSystemDto) {
        dto.myUser = req.user;
        return resOK(await this.profileService.createReport(dto));
    }
}
