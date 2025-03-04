/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";
import {Platform} from "../../../core/utils/enums";
import pM from "mongoose-paginate-v2";

export interface IAdminNotification {
    content: string,
    title: string,
    imageUrl?: string,
}


export const AdminNotificationSchema = new mongoose.Schema(
    {
        content: {type: String, required: true},
        title: {type: String, required: true},
        imageUrl: {type: String,}
    },
    {
        timestamps: true
    }
);
AdminNotificationSchema.plugin(pM)






