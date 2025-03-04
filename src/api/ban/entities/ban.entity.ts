/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose, {Schema} from "mongoose";
import pM from "mongoose-paginate-v2";
import {AdminNotificationSchema} from "../../admin_notification/entities/admin_notification.entity";

export interface IBan {
    _id: string
    bannerId: string
    targetId: string
    createdAt: Date,
    updatedAt: Date,
}

export const BanSchema = new mongoose.Schema(
    {
        bannerId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
        targetId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
        createdAt: {type: Date},
        updatedAt: {type: Date}
    },
    {
        timestamps: true,
        
    }
);
BanSchema.index({bannerId: 1, targetId: 1}, {unique: true});
BanSchema.plugin(pM)