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
    Param,
    Patch, Post,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {ChannelService} from '../services/channel.service';
import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {resOK} from "../../../core/utils/res.helpers";
import {MongoRoomIdDto} from "../../../core/common/dto/mongo.room.id.dto";
import {MongoPeerIdDto} from "../../../core/common/dto/mongo.peer.id.dto";
import {CreateOrderRoomDto} from "../../../core/common/dto/mongo.peer.id.order.id.dto";
import {jsonDecoder} from "../../../core/utils/app.validator";


@UseGuards(VerifiedAuthGuard)
@V1Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {
    }


    @Get('/')
    async getRooms(@Req() req: any, @Query() dto: Object) {
        return resOK(await this.channelService.getRoomsLimited(dto, req.user._id));
    }

    @Get('/:roomId/un-read-count')
    async getRoomUnReadCount(@Req() req: any, @Param() dto: MongoRoomIdDto,) {
        dto.myUser = req.user
        return resOK(await this.channelService.getRoomUnReadCount(dto,));
    }

    @Post('/peer-room/:peerId')
    // @UseInterceptors(TransactionInterceptor)
    async getOrCreatePeerRoom(@Req() req: any, @Param() dto: MongoPeerIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.getOrCreatePeerRoom(dto, null));
    }

    @Patch('/:roomId/translate')
    async updateRoomTranslate(
        @Req() req: any,
        @Param() dto: MongoRoomIdDto,
        @Body('transTo') transTo: string,
    ) {
        if (!transTo) {
            throw new BadRequestException('transTo is required');
        }
        dto.myUser = req.user;
        return resOK(await this.channelService.updateRoomTranslate(dto, transTo));
    }

    @Patch('/:roomId/nick-name')
    async changeRoomNickName(@Req() req: any, @Param() dto: MongoRoomIdDto, @Body('name') name) {
        dto.myUser = req.user;

        return resOK(await this.channelService.changeNickName(dto, name));
    }

    @Patch('/:roomId/translate/stop')
    async stopRoomTranslate(
        @Req() req: any,
        @Param() dto: MongoRoomIdDto,
    ) {
        dto.myUser = req.user;
        return resOK(await this.channelService.stopRoomTranslate(dto));
    }

    @Get('/:roomId')
    async getRoomById(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.getRoomById(dto));
    }

    @Get('/:roomId/url-preview')
    async getUrlPreview(@Req() req: any, @Param() dto: MongoRoomIdDto, @Query('url') url:any) {
        dto.myUser = req.user;
        return resOK(await this.channelService.getUrlPreview(dto,url));
    }


    @Patch('/:roomId/deliver')
    async deliverRoomMessages(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.deliverRoomMessages(dto));
    }


    @Patch('/:roomId/notification/mute')
    async muteRoomNotification(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.muteRoomNotification(dto,));
    }

    @Patch('/:roomId/one-seen/on')
    async roomOneSeenOn(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.roomOneSeenOn(dto,));
    }

    @Patch('/:roomId/one-seen/off')
    async roomOneSeenOff(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.roomOneSeenOff(dto,));
    }

    @Patch('/:roomId/notification/un-mute')
    async unMuteRoomNotification(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.unMuteRoomNotification(dto,));
    }

    @Patch('/:roomId/archive')
    async archiveRoom(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.archiveRoom(dto,));
    }

    @Patch('/:roomId/un-archive')
    async unArchiveRoom(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.unArchiveRoom(dto,));
    }

    @Get('/:roomId/single/my-info')
    async getMySingleChatInfo(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.getMySingleChatInfo(dto));
    }


    @Post('/order')
    async createOrderRoom(@Req() req: any, @Body() dto: CreateOrderRoomDto) {
        dto.myUser = req.user;
        try {
            dto.orderData = jsonDecoder(dto.orderData)
        } catch (e) {
            //
        }
        return resOK(await this.channelService.createOrderRoom(dto,));
    }

    @Get('/:roomId/order/my-info')
    async getMyOrderChatInfo(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.getMyOrderChatInfo(dto));
    }

    @Delete('/:roomId')
    async deleteRoom(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.deleteRoom(dto));
    }

    @Delete('/:roomId/clear')
    async clearRoomMessages(@Req() req: any, @Param() dto: MongoRoomIdDto) {
        dto.myUser = req.user;
        return resOK(await this.channelService.clearRoomMessages(dto));
    }

    @Get('/messages/stars')
    async getStarMessages(@Req() req: any, @Query() dto: Object) {
        return resOK(await this.channelService.getStarMessages(dto, req.user._id));
    }
}
