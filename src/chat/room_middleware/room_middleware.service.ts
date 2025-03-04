/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { RoomMemberService } from "../room_member/room_member.service";
import { SingleRoomSettingsService } from "../single_room_settings/single_room_settings.service";
import { IRoomMember } from "../room_member/entities/room_member.entity";
import { ISingleRoomSettings } from "../single_room_settings/entities/single_room_setting.entity";



@Injectable()
export class RoomMiddlewareService {
    constructor(
        private readonly roomMember: RoomMemberService,
        private readonly singleRoomSetting: SingleRoomSettingsService,
    ) {
    }

    async isThereRoomMember(roomId: string, userId: string, select?) {
        return this.roomMember.findOne({uId: userId, rId: roomId}, select);
    }

    async isThereRoomMemberOrThrow(roomId: string, userId: string): Promise<IRoomMember> {
        let r = await this.isThereRoomMember(roomId, userId);
        if (!r) throw new NotFoundException("While isThereRoomOrThrow No room between roomId " + roomId + " and user " + userId);
        return r
    }

    // async isThereRoomMemberAndNotBanedOrThrow(roomId: string, userId: string): Promise<IRoomMember> {
    //     let r = await this.isThereRoomMemberOrThrow(roomId, userId);
    //     let ban = await this.userBanService.getBan(r.pId, r.uId)
    //     if (ban) throw new BadRequestException("You dont have access you has been out")
    //     return r
    // }


    async getSingleRoomId(peerId: string, myId: string) {
        let x: ISingleRoomSettings = await this.getSingleRoomSetting(peerId, myId);
        if (!x) {
            return null;
        }
        return x._id.toString();
    }

    async getSingleRoomSetting(user1: string, user2: string) {
        return this.singleRoomSetting.findOne({
            $or: [
                {$and: [{cId: user1}, {pId: user2}]},
                {$and: [{pId: user1}, {cId: user2}]}
            ]
        });
    }

    async unDeleteAllRoomMembers(roomId: string) {
        return this.roomMember.updateMany(
            {
                rId: roomId,
                isD: true
            },
            {isD: false}
        );
    }
}
