/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    BadRequestException,
    Body,
    Controller, Delete,
    Get,
    Param,
    Patch,
    Post, Query,
    Req, UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";

import {GroupChannelService} from "../services/group.channel.service";
import {UpdateRoleDto} from "../dto/update.role.dto";
import {CreateGroupRoomDto} from "../dto/create-group-room.dto";
import {KickMembersDto} from "../dto/kick.members.dto";

import {InjectConnection} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {MessageStatusParamDto} from "../dto/message_status_param_dto";
import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {imageFileInterceptor} from "../../../core/utils/upload_interceptors";
import {jsonDecoder} from "../../../core/utils/app.validator";
import {resOK} from "../../../core/utils/res.helpers";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {MongoIdsDto} from "../../../core/common/dto/mongo.ids.dto";
import {DefaultPaginateParams} from "../../../core/common/dto/paginateDto";
import {UsersSearchDto} from "../dto/users_search_dto";

@UseGuards(VerifiedAuthGuard)
@V1Controller("channel")
export class GroupChannelController {
    constructor(
        private readonly groupService: GroupChannelService,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) {
    }

    @UseInterceptors(imageFileInterceptor)
    @Post("/group")
    async createGroupChat(
        @Req() req:any,
        @Body() dto: CreateGroupRoomDto,
        @UploadedFile() file?: any
    ) {
        dto.myUser = req.user;
        if (file) {
            dto.imageBuffer = file.buffer;
        }
        try {
            dto.peerIds = jsonDecoder(dto.peerIds);
        } catch (e) {
        }
        try {
            if (dto.extraData)
                dto.extraData = jsonDecoder(dto.extraData);
        } catch (e) {
            //
        }
        return resOK(await this.groupService.createGroupChat(dto, null));
    }

    @Post("/:roomId/group/members")
    // @UseInterceptors(TransactionInterceptor)
    async addMembersToGroup(
        @Req() req:any,
        @Param() gId: MongoRoomIdDto,
        @Body() dto: MongoIdsDto
    ) {
        dto.myUser = req.user;
        return resOK(await this.groupService.addMembersToGroup(gId.roomId, dto));
    }


    @Patch("/:roomId/group/members/:peerId/:role")
    async updateUserRole(@Req() req:any, @Param() dto: UpdateRoleDto) {
        dto.myUser = req.user;
        return resOK(await this.groupService.changeGroupUserRole(dto));
    }


    @Get("/:roomId/group/message/:messageId/status/:type")
    async getGroupMessageInfo(
        @Req() req:any,
        @Param() dto: MessageStatusParamDto,
        @Query() paginateParams: DefaultPaginateParams
    ) {
        dto.myUser = req.user;
        paginateParams.myUser = req.user;
        return resOK(await this.groupService.getGroupMessageInfo(dto, paginateParams));
    }


    @Get("/:roomId/group/my-info")
    async getMyGroupInfo(@Req() req:any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.groupService.getMyGroupInfo(dto));
    }


    @Patch("/:roomId/group/extra-data")
    async updateGroupExtraData(@Req() req:any, @Param() dto: MongoRoomIdDto, @Body() data:any) {
        dto.myUser = req.user;
        try {
            data = jsonDecoder(data);
        } catch (err) {
        }
        return resOK(await this.groupService.updateGroupExtraData(dto, data));
    }


    @Get("/:roomId/group/my-status")
    async getMyGroupStatus(@Req() req:any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.groupService.getMyGroupStatus(dto));
    }

    ///get and search also
    @Get("/:roomId/group/members")
    async getGroupMembers(
        @Req() req:any,
        @Param() mongoDto: MongoRoomIdDto,
        @Query() dto: UsersSearchDto
    ) {
        return resOK(await this.groupService.getGroupMembers(req.user, dto, mongoDto.roomId));
    }

    // @Get('/:roomId/group/msg/status/:messageId/:type')
    // async getMessageStatusGroup(
    //     @Req() req:any,
    //     @Param() dto: MessageStatusParamDto,
    //     @Query() pDto: MessageStatusPaginateDto,
    // ) {
    //     pDto.myUser = req.user;
    //     dto.myUser = req.user;
    //     return resOK(await this.groupService.getMessageStatusGroup(dto, pDto));
    // }

    @Delete("/:roomId/group/members/:peerId")
    async kickGroupMember(@Req() req:any, @Param() dto: KickMembersDto) {
        dto.myUser = req.user;
        return resOK(await this.groupService.kickGroupMember(dto));
    }

    @Post("/:roomId/group/leave")
    async leaveGroupChat(@Req() req:any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.groupService.leaveGroupChat(dto));
    }

    @Patch("/:roomId/group/title")
    async updateTitle(@Req() req:any, @Param() dto: MongoRoomIdDto, @Body("title") title?: string) {
        dto.myUser = req.user;
        if (!title) {
            throw new BadRequestException("title is required");
        }
        return resOK(await this.groupService.updateTitle(dto, title));
    }

    @Patch("/:roomId/group/description")
    async updateDescription(@Req() req:any, @Param() dto: MongoRoomIdDto, @Body("description") description?: string) {
        dto.myUser = req.user;
        if (!description) {
            throw new BadRequestException("description is required");
        }
        return resOK(await this.groupService.updateDescription(dto, description));
    }


    @UseInterceptors(imageFileInterceptor)
    @Patch("/:roomId/group/image")
    async updateImage(@Req() req:any, @Param() dto: MongoRoomIdDto, @UploadedFile() file?: any) {
        if (!file) {
            throw new BadRequestException("image is required");
        }
        dto.myUser = req.user;
        return resOK(await this.groupService.updateImage(dto, file));
    }

    @Get("/:roomId/group/available-users-to-add")
    async getAvailableUsersToAdd(
        @Req() req:any,
        @Query() dto: Object,
        @Param() roomId: MongoRoomIdDto
    ) {
        return resOK(await this.groupService.getAvailableUsersToAdd(dto, roomId.roomId,req.user._id));
    }
}
