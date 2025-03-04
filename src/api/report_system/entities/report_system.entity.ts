/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";
import {Platform} from "../../../core/utils/enums";
import pM from "mongoose-paginate-v2";
import {MessageSchema} from "../../../chat/message/entities/message.entity";
import {RoomMemberSchema} from "../../../chat/room_member/entities/room_member.entity";


export interface IReport {
    uId: string,
    content: string,
    type: string,
    targetId: string,
    isDeleted: boolean,
    platform: Platform,
}


export const ReportSchema = new mongoose.Schema(
    {
        uId: {type: String, required: true, ref: "user"},
        targetId: {type: String, required: true, ref: "user"},
        content: {type: String, required: true},
        type: {type: String, required: true},
        isDeleted: {type: Boolean, default: false},
    },
    {
        timestamps: true
    }
);
ReportSchema.index({uId: 1, targetId: 1}, {unique: true})
ReportSchema.plugin(pM)