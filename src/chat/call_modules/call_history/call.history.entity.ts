/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose, {Schema} from "mongoose";
import pM from "mongoose-paginate-v2"
import {CallStatus, MeetPlatform, RoomType} from "../../../core/utils/enums";

export interface ICallHistory {
    _id: string
    caller: string;
    participants: string[];
    callee?: string;
    callStatus: CallStatus;
    roomId: string
    withVideo: boolean
    roomType: RoomType
    meetPlatform: MeetPlatform,
    deleteFrom: any[],
    endAt?: Date
    createdAt: Date
}

export const CallHistorySchema = new mongoose.Schema(
    {
        caller: {type: String, required: true, ref: "user"},
        callee: {type: String,   ref: "user", default: null},
        participants: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },], default: [], required: true
        },
        callStatus: {type: String, enum: Object.values(CallStatus), required: true, index: 1},
        roomId: {type: String, required: true, ref: "group_settings"},
        roomType: {type: String, required: true},
        withVideo: {type: Boolean, required: true},
        meetPlatform: {type: String, enum: Object.values(MeetPlatform), default: MeetPlatform.WebRtc},
        endAt: {type: Date, default: null},
        deleteFrom: {type: [Schema.Types.ObjectId], default: []},
    },
    {
        timestamps: true,
    }
);
CallHistorySchema.plugin(pM)