/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose, {Schema} from "mongoose";
import {Platform, VPushProvider} from "../../../../core/utils/enums";

export interface IUserDevice {
    _id: string
    //deviceId of the mobile or web or etc...
    userDeviceId: string;
    uId: string;
    lastSeenAt: Date;
    visits: number;
    deviceInfo: {};
    platform: Platform;
    //deviceIp
    dIp: string;
    pushProvider?: VPushProvider
    language: String;
    pushKey?: string,
    voipKey?: string,
    clintVersion?: string,
    createdAt: Date,
    updatedAt: Date,
}

export const UserDeviceSchema = new mongoose.Schema(
    {
        userDeviceId: {type: String, required: true},
        uId: {type: Schema.Types.ObjectId, ref: "user", required: true, index: 1},
        deviceInfo: {type: Object, default: {}},
        dIp: {type: String, required: true},
        pushProvider: {
            type: String,
            default: null,
        },
        platform: {
            type: String,
            required: true,
            enum: Object.values(Platform),
        },
        pushKey: {type: String, default: null},
        voipKey: {type: String, default: null},
        language: {type: String, default: "en"},
        clintVersion: {type: String,},
        lastSeenAt: {type: Date, default: Date.now()},
        visits: {type: Number, default: 1},
        createdAt: {type: Date },
        updatedAt: {type: Date, select: false}
    },
    {
        timestamps: true
    }
);