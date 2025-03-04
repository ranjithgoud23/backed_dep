/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {UserDeviceService} from "../../user_modules/user_device/user_device.service";
import {Platform} from "../../../core/utils/enums";
import {newMongoObjId} from "../../../core/utils/utils";

@Injectable()
export class UserDeviceAdminService {
    constructor(readonly userDeviceService: UserDeviceService,) {
    }

    async getUsersDevicesInfo() {
        return {
            "all": await this.userDeviceService.findCount(),
            "web": await this.userDeviceService.findCount({
                platform: Platform.Web
            }),
            "ios": await this.userDeviceService.findCount({
                platform: Platform.Ios
            }),
            "mac": await this.userDeviceService.findCount({
                platform: Platform.Mac
            }),
            "windows": await this.userDeviceService.findCount({
                platform: Platform.Windows
            }),
            "linux": await this.userDeviceService.findCount({
                platform: Platform.Linux
            }),
            "android": await this.userDeviceService.findCount({
                platform: Platform.Android
            }),
            "other": await this.userDeviceService.findCount({
                platform: Platform.Other
            })
        }
    }

    async getTotalVisits() {
        let data = await this.userDeviceService.aggregate([
            {$group: {_id: null, visits: {$sum: "$visits"}}}
        ])
        if (data.length == 0) {
            return 0
        }
        return data[0]['visits']
    }

    async getUserVisits(id: string) {
        let data = await this.userDeviceService.aggregate([
            {
                $match: {
                    uId: newMongoObjId(id.toString())
                }
            }
            , {$group: {_id: null, visits: {$sum: "$visits"}}}
        ])
        if (data.length == 0) {
            return 0
        }
        return data[0]['visits']
    }

    async getPlatformVisits(plt:Platform) {
        let data = await this.userDeviceService.aggregate([
            {
                $match: {
                    platform:plt
                }
            },
            {
                $group: {_id: null, visits: {$sum: "$visits"}}
            }
        ])
        if (data.length == 0) {
            return 0
        }
        return data[0]['visits']
    }
}
