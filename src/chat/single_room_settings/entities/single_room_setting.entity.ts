/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";

export interface ISingleRoomSettings extends Document {
    _id: string
    //creator id
    cId: string
    //peerId
    pId: string
    createdAt: Date,
    updatedAt: Date,
}

export const SingleRoomSettings: Schema = new Schema({
    cId: {type: Schema.Types.ObjectId, required: true, ref: "user",index:1},
    pId: {type: Schema.Types.ObjectId, required: true, ref: "user",index:1},
    updatedAt: {type: Date, select: false}
}, {
    timestamps: true,
     

});
SingleRoomSettings.index({cId: 1, pId: 1}, {unique: true})
