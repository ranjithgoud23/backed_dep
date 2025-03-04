/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param, Patch,
    Post, Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {MessageChannelService} from "../services/message.channel.service";
import {FilesInterceptor} from "@nestjs/platform-express";
import {SendMessageDto} from "../dto/send.message.dto";
import {DeleteMessageDto} from "../dto/delete.message.dto";
import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {resOK} from "../../../core/utils/res.helpers";
import {MessagesSearchDto} from "../../message/dto/messages_search_dto";
import {RoomIdAndMsgIdDto} from "../../../core/common/dto/room.id.and.msg.id.dto";


@UseGuards(VerifiedAuthGuard)
@V1Controller('channel/:roomId/message') //stars
export class MessageChannelController {
    constructor(
        private readonly channelMessageService: MessageChannelService
    ) {
    }


    @UseInterceptors(
        FilesInterceptor('file', 2, {
            limits: {
                files: 4,
                fields: 400,
                fieldSize: 400000000000,
                fieldNameSize: 400000000000,
            },
        }),
    )
    @Post('/')
    async createMessage(
        @Req() req:any,
        @Param() roomDtoId: MongoRoomIdDto,
        @Body() dto: SendMessageDto,
        @UploadedFiles() file?: any[],
    ) {
        dto.myUser = req.user;
        if (dto.isRequireFile()) {
            dto._mediaFile = file[0];
            dto._secondMediaFile = file[1] ?? undefined;
            if (!dto._mediaFile) throw new BadRequestException("Msg type " + dto.messageType + " required file in multipart or file bigger than the limit!")
        }
        dto._roomId = roomDtoId.roomId;
        dto._platform = dto.myUser.currentDevice.platform;
        return (resOK(await this.channelMessageService.createMessage(dto)));
    }

    @Delete('/:messageId/delete/:type')
    async deleteRoomMessage(@Req() req:any, @Param() dto: DeleteMessageDto) {
        dto.myUser = req.user;
        return resOK(await this.channelMessageService.deleteRoomMessage(dto));
    }

    @Post('/:messageId/star')
    async starRoomMessage(@Req() req:any, @Param() dto: RoomIdAndMsgIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelMessageService.starRoomMessage(dto));
    }

    @Post('/:messageId/un-star')
    async unStarRoomMessage(@Req() req:any, @Param() dto: RoomIdAndMsgIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelMessageService.unStarRoomMessage(dto));
    }

    @Get('/stars')
    async getMyAllStarMessages(@Req() req:any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelMessageService.getMyAllStarMessages(dto));
    }



    @Get('/')
    async getRoomMessages(
        @Req() req:any,
        @Param() paramDto: MongoRoomIdDto,
        @Query() dto: MessagesSearchDto,
    ) {
        return resOK(await this.channelMessageService.getRoomMessages(req.user._id, paramDto.roomId, dto));
    }

    @Patch('/:messageId/one-seen')
    async oneSeeThisMessage(@Req() req:any, @Param() dto: RoomIdAndMsgIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelMessageService.oneSeeThisMessage(dto));
    }

}