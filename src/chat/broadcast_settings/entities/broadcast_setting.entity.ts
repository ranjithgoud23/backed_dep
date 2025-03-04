/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";

export interface IBroadcastSetting extends Document {
    //roomId
    _id: string;
    outUsers: [];
    cId: string;
    //broadcast name
    bName: string;
    //broadcast image
    bImg: string;
    createdAt: Date,
}

export const BroadcastSettingSchema: Schema = new Schema({
    //creator id
    cId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    // users left this broadcast
    outUsers: {type: [Schema.Types.ObjectId], default: []},
    bName: {type: String, required: true},
    bImg: {type: String, required: true},
    createdAt: {type: Date, select: false},
    updatedAt: {type: Date, select: false}
}, {
    timestamps: true,
     
});