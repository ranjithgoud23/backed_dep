/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    UseInterceptors,
    UploadedFile
} from "@nestjs/common";
import {AdminPanelService} from "./admin_panel.service";
import {V1Controller} from "../../core/common/v1-controller.decorator";
import {IsSuperAdminGuard} from "../../core/guards/is.admin.or.super.guard";
import {UpdateConfigDto} from "./dto/update_config_dto";
import {resOK} from "../../core/utils/res.helpers";
import {MongoIdDto} from "../../core/common/dto/mongo.id.dto";
import {BanToDto, CreateNewVersionDto, GetVersionDto} from "./dto/admin_dto";
import {CreateAdminNotificationDto} from "../admin_notification/dto/create-admin_notification.dto";
import {MongoRoomIdDto} from "../../core/common/dto/mongo.room.id.dto";
import {imageFileInterceptor} from "../../core/utils/upload_interceptors";

@UseGuards(IsSuperAdminGuard)
@V1Controller("admin-panel")
export class AdminPanelController {
    constructor(private readonly adminPanelService: AdminPanelService) {
    }

    @Patch("/config")
    async updateConfig(@Req() req: any, @Body() dto: UpdateConfigDto) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        return resOK(await this.adminPanelService.updateConfig(dto));
    }

    @Get("/config")
    async getConfig(@Req() req: any) {
        return resOK(await this.adminPanelService.getAppConfig( ));
    }

    @Patch("/versions")
    async setNewVersion(@Req() req: any, @Body() dto: CreateNewVersionDto) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        return resOK(await this.adminPanelService.setNewVersion(dto));
    }

    @Post("/notifications")
    @UseInterceptors(imageFileInterceptor)
    async createNotifications(
        @Req() req: any,
        @Body() dto: CreateAdminNotificationDto,
        @UploadedFile() file?: any
    ) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        if (file) {
            dto.imageBuffer = file.buffer;
        }
        return resOK(await this.adminPanelService.createNotification(dto));
    }

    @Get("/notifications")
    async getNotifications() {
        return resOK(await this.adminPanelService.getNotification());
    }

    @Get("/users/log")
    async getUsersLog() {
        return resOK(await this.adminPanelService.getUsersLog());
    }


    @Get("/versions/:platform")
    async getVersionDashboard(@Param() platform: GetVersionDto) {
        return resOK(await this.adminPanelService.getVersions(platform));
    }

    @Delete("/versions/:id")
    async deleteVersion(@Req() req: any, @Param() id: MongoIdDto) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        return resOK(await this.adminPanelService.deleteVersion(id));
    }

    @Get("/countries")
    async getCountryInfo() {
        return resOK(await this.adminPanelService.getCountriesInfo());
    }

    @Get("/user/info/:id")
    async getUserInfo(@Param() dto: MongoIdDto) {
        return resOK(await this.adminPanelService.getUserInfo(dto));
    }

    @Get("/user/info/:id/chats")
    async getUserChats(@Param() dto: MongoIdDto, @Query() filter: Object) {
        return resOK(await this.adminPanelService.getUserChats(dto.id, filter));
    }

    @Get("/user/info/:id/chats/:roomId")
    async getUserChatsMessages(
        @Param() roomIdDto: MongoRoomIdDto,
        @Query() filter: Object,
        @Param() userId: MongoIdDto,
    ) {
        return resOK(await this.adminPanelService.getUserChatsMessages(userId.id, roomIdDto.roomId, filter));
    }

    @Patch("/user/info/:id")
    async updateUserInfo(
        @Req() req: any,
        @Param() dto: MongoIdDto,
        @Body() body: object
    ) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        return resOK(await this.adminPanelService.updateUserInfo(dto.id, body));
    }

    @Get("/users")
    async getUsers(@Query() dto: Object) {
        return resOK(await this.adminPanelService.getUsers(dto));
    }

    @Post("/login")
    async login(@Req() req: any) {
        return resOK(await this.adminPanelService.login(req['isViewer']));
    }

    @Get("/dashboard")
    async getDashboard() {
        return resOK(await this.adminPanelService.getDashboard());
    }

    @Get("/users/reports")
    async getUserReports(@Query() filter: Object,) {
        return resOK(await this.adminPanelService.getUserReports(filter));
    }

    @Delete("/users/reports/:id")
    async deleteReport(@Req() req: any, @Param() dto: MongoIdDto,) {
        if (req['isViewer']) {
            return resOK("YOU ARE VIEWER !!!")
        }
        return resOK(await this.adminPanelService.deleteReport(dto.id));
    }

}

