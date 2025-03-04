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

import {KickMembersDto} from "../dto/kick.members.dto";
import {BroadcastChannelService} from "../services/broadcast.channel.service";
import {CreateBroadcastRoomDto} from "../dto/create-broadcast-room.dto";
import {MessageStatusParamDto} from "../dto/message_status_param_dto";
import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {imageFileInterceptor} from "../../../core/utils/upload_interceptors";
import {jsonDecoder} from "../../../core/utils/app.validator";
import {resOK} from "../../../core/utils/res.helpers";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {MongoIdsDto} from "../../../core/common/dto/mongo.ids.dto";
import {UsersSearchDto} from "../dto/users_search_dto";
import {DefaultPaginateParams} from "../../../core/common/dto/paginateDto";


@UseGuards(VerifiedAuthGuard)
@V1Controller('channel')
export class BroadcastChannelController {
    constructor(private readonly broadcastService: BroadcastChannelService) {
    }


    @UseInterceptors(
        imageFileInterceptor,
    )
    @Post('/broadcast')
    async createBroadcastChat(
        @Req() req:any,
        @Body() dto: CreateBroadcastRoomDto,
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
        return resOK(await this.broadcastService.createBroadcastChat(dto,));
    }


    @Post('/:roomId/broadcast/members')
    // @UseInterceptors(TransactionInterceptor)
    async addMembersToBroadcast(@Req() req:any, @Param() bId: MongoRoomIdDto, @Body() dto: MongoIdsDto) {
        dto.myUser = req.user;
        return resOK(await this.broadcastService.addMembersToBroadcast(bId.roomId, dto, null));
    }


    ///get and search also
    @Get('/:roomId/broadcast/members')
    async getBroadcastMembers(@Req() req:any, @Param() mongoDto: MongoRoomIdDto, @Query() dto: UsersSearchDto) {
        return resOK(await this.broadcastService.getBroadcastMembers(req.user, dto, mongoDto.roomId));
    }

    @Get('/:roomId/broadcast/my-info')
    async getBroadcastMyInfo(@Req() req:any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.broadcastService.getBroadcastMyInfo(dto));
    }

    @Get('/:roomId/broadcast/message/:messageId/status/:type')
    async getBroadcastMessageInfo(
        @Req() req:any,
        @Param() dto: MessageStatusParamDto,
        @Query() paginateParams: DefaultPaginateParams,
    ) {
        dto.myUser = req.user;
        paginateParams.myUser = req.user;
        return resOK(await this.broadcastService.getBroadcastMessageInfo(dto, paginateParams));
    }

    @Delete('/:roomId/broadcast/members/:peerId')
    async kickBroadcastMember(@Req() req:any, @Param() dto: KickMembersDto) {
        dto.myUser = req.user;
        return resOK(await this.broadcastService.kickBroadcastMember(dto,));
    }


    @Patch('/:roomId/broadcast/title')
    async updateTitle(@Req() req:any, @Param() dto: MongoRoomIdDto, @Body('title') title?: string) {
        dto.myUser = req.user;
        if (!title) {
            throw new BadRequestException('title is required');
        }
        return resOK(await this.broadcastService.updateTitle(dto, title));
    }


    @UseInterceptors(imageFileInterceptor)
    @Patch('/:roomId/broadcast/image')
    async updateImage(@Req() req:any, @Param() dto: MongoRoomIdDto, @UploadedFile() file?: any) {
        if (!file) {
            throw new BadRequestException("image is required")
        }
        dto.myUser = req.user;
        return resOK(await this.broadcastService.updateImage(dto, file));
    }

    @Get("/:roomId/broadcast/available-users-to-add")
    async getAvailableUsersToAdd(
        @Req() req:any,
        @Query() dto: Object,
        @Param() roomId: MongoRoomIdDto
    ) {
        return resOK(await this.broadcastService.getAvailableUsersToAdd(dto, roomId.roomId, req.user._id));
    }
}
