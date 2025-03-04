/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from "@nestjs/common";
import {MongoPeerIdDto} from "../../../core/common/dto/mongo.peer.id.dto";
import {IBan} from "../../ban/entities/ban.entity";
import {UserService} from "../user/user.service";
import {BanService} from "../../ban/ban.service";
import {RoomMemberService} from "../../../chat/room_member/room_member.service";
import {SocketIoService} from "../../../chat/socket_io/socket_io.service";
import {RoomMiddlewareService} from "../../../chat/room_middleware/room_middleware.service";
import {SocketEventsType} from "../../../core/utils/enums";
import {PaginationParameters} from "mongoose-paginate-v2";

@Injectable()
export class UserBanService {
    constructor(
        private readonly userService: UserService,
        private readonly banService: BanService,
        private readonly roomMember: RoomMemberService,
        private readonly socketIoService: SocketIoService,
        private readonly roomMiddleWar: RoomMiddlewareService
    ) {
    }

    async getMyBlockMeOnly(myId: string, dto: Object) {
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 20,
                    page: 1,
                    sort: "-_id",
                    ...dto,
                    populate: [
                        {
                            path: "targetId",
                            select: "fullName bio userImage",
                        },
                    ]
                },
            }
        ).get()
        delete dto['limit']
        delete dto['page']
        paginationParameters[0] = {...dto,bannerId:myId};
        return await this.banService.paginate(paginationParameters)
    }

    async getMyBlockTheyAndMe(myId: string) {
        let outUsers:string[] = [];
        let bans = await this.banService.findAll({
            $or: [
                {bannerId: myId},
                {targetId: myId}
            ]
        }, "bannerId targetId");
        for (let b of bans) {
            if (b.bannerId != myId) {
                outUsers.push(b.bannerId.toString());
            }
            if (b.targetId != myId) {
                outUsers.push(b.targetId.toString());
            }
        }
        return outUsers;
    }

    async _updateSingleChatBlock(peerIdDto: MongoPeerIdDto, myId: string, toBlock: boolean) {
        let singleChatId = await this.roomMiddleWar.getSingleRoomId(peerIdDto.peerId, myId);
        if (!singleChatId) return;
        if (toBlock) {
            this.socketIoService.io.to(singleChatId)
                .emit(SocketEventsType.v1OnBanUserChat, JSON.stringify({
                    ...(await this.checkBans(peerIdDto)),
                    "roomId": singleChatId
                }));
            await this.socketIoService.leaveRooms({
                roomId: singleChatId, usersIds: [
                    peerIdDto.peerId.toString(),
                    myId.toString()
                ]
            });
        } else {
            await this.socketIoService.joinRoom({
                roomId: singleChatId, usersIds: [
                    peerIdDto.peerId.toString(),
                    myId.toString()
                ]
            });
            this.socketIoService.io.to(singleChatId)
                .emit(SocketEventsType.v1OnBanUserChat, JSON.stringify({
                    ...(await this.checkBans(peerIdDto)),
                    "roomId": singleChatId
                }));
        }
    }


    async getBan(myId: string, peerId: string) {
        return this.banService.findOne({
            $or: [
                {$and: [{targetId: myId}, {bannerId: peerId}]},
                {$and: [{bannerId: myId}, {targetId: peerId}]}
            ]
        });
    }

    async ban(dto: MongoPeerIdDto) {
        if (dto.peerId == dto.myUser._id) throw new BadRequestException("You cant ban your self");

        let ban: IBan = await this.getBan(dto.myUser._id, dto.peerId);
        if (ban) {
            //check if me banner
            let myBan: IBan = await this.banService.findOne({
                bannerId: dto.myUser._id,
                targetId: dto.peerId
            });
            if (myBan) {
                return "You already ban this user";
            }
            //he blocks me but i not yet
            await this.banService.create({
                bannerId: dto.myUser._id,
                targetId: dto.peerId
            });
            await this._updateSingleChatBlock(dto, dto.myUser._id, true);
        } else {
            //block
            await this.banService.create({
                bannerId: dto.myUser._id,
                targetId: dto.peerId
            });
            await this._updateSingleChatBlock(dto, dto.myUser._id, true);
        }
        return "you block successfully";
    }

    async unBan(dto: MongoPeerIdDto) {
        if (dto.peerId == dto.myUser._id) throw new BadRequestException("You cant un ban your self");
        if (dto.peerId.toString() == dto.myUser._id) {
            throw new BadRequestException("You cant apply this action to your self")
        }
        let ban: IBan = await this.getBan(dto.myUser._id, dto.peerId)
        if (!ban) return "Already un baned"
        let myBan: IBan = await this.banService.findOne({
            bannerId: dto.myUser._id,
            targetId: dto.peerId
        })
        if (!myBan) {
            throw new BadRequestException("you dont have access you dont have baned this user")
        }
        await this.banService.findByIdAndDelete(myBan._id)

        await this._updateSingleChatBlock(dto, dto.myUser._id, false);

        return "success"
    }

    async checkBans(dto: MongoPeerIdDto) {
        let singleChatId = await this.roomMiddleWar.getSingleRoomId(dto.peerId, dto.myUser._id);
        let res = {
            isMeBanner: false,
            isPeerBanner: false,
            roomId: singleChatId ?? ""
        };
        let bans = await this.banService.findAll({
            $or: [
                {$and: [{targetId: dto.myUser._id}, {bannerId: dto.peerId}]},
                {$and: [{bannerId: dto.myUser._id}, {targetId: dto.peerId}]}
            ]
        });
        if (bans.length == 0) {
            return res;
        }
        for (let ban of bans) {
            if (ban.bannerId.toString() == dto.myUser._id) {
                res.isMeBanner = true;
            } else {
                res.isPeerBanner = true;
            }
        }
        return res;
    }
}
