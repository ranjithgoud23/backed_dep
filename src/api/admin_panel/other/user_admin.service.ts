/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from '@nestjs/common';
import {PaginationParameters} from "mongoose-paginate-v2";
import {remove} from "remove-accents";
import {UserService} from "../../user_modules/user/user.service";
import {RegisterStatus} from "../../../core/utils/enums";
import {SocketIoService} from "../../../chat/socket_io/socket_io.service";
import {UserDeviceService} from "../../user_modules/user_device/user_device.service";

@Injectable()
export class UserAdminService {
    constructor(
        private readonly userService: UserService,
        private readonly socket: SocketIoService,
        private readonly userDeviceService: UserDeviceService,
    ) {
    }

    async getUsers(dto: Object) {
        let filter: object = {};
        let paginationParameters = new PaginationParameters({
            query: {
                limit: 30,
                page: 1,
                ...dto,
                select: "-password -userDevice", populate: "countryId",
            }
        }).get();
        if (paginationParameters[1].page <= 0) {
            paginationParameters[1].page = 1;
        }
        if (paginationParameters[1].limit <= 0 || paginationParameters[1].limit >= 100) {
            paginationParameters[1].limit = 100;
        }
        let fullName = dto["fullName"];
        if (fullName) {
            filter = {
                ...filter,
                fullName: {
                    "$regex": ".*" + remove(fullName) + ".*",
                    "$options": "i",
                }
            };
        }
        paginationParameters[0] = filter;
        return await this.userService.fullPaginateModel(paginationParameters);
    }


    async getUsersData() {
        return {
            "totalUsersCount": await this.userService.findCount(),
            "deleted": await this.userService.findCount({
                deletedAt: {$ne: null}
            }),
            "banned": await this.userService.findCount({
                banTo: {$ne: null}
            }),
            "allVerifiedUsersCount": await this.userService.findCount({
                verifiedAt: {$ne: null}
            }),
            "userStatusCounter": {
                "accepted": await this.userService.findCount({
                    registerStatus: {$eq: RegisterStatus.accepted}
                }),
                "pending": await this.userService.findCount({
                    registerStatus: {$eq: RegisterStatus.pending}
                }),
                "notAccepted": await this.userService.findCount({
                    registerStatus: {$eq: RegisterStatus.notAccepted}
                })
            },
            "online": await this.socket.getOnlineSocketsNumber()
        };
    }

    async updateUserData(id: string, body: object) {
        await this.userService.findByIdAndUpdate(id, body)
    }

    async getUsersLog() {
        let res = []
        let users = await this.userService.findAll({}, "fullName userImage bio createdAt lastSeenAt", {
            sort: "-_id",
            limit: 70,
            lean: true
        })
        for (let u of users) {
            let device = await this.userDeviceService.findOne({
                uId: u._id
            }, "platform", {
                sort: "_id"
            })
            res.push({...u, "platform": device.platform})
        }
        return res;
    }
}
