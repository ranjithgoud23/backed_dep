/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";

export interface IOrderRoomSettings extends Document {
    _id: string
    //creator id
    cId: string
    //peerId
    pId: string
    pinData?: object
    orderTitle?: string
    orderImage?: string
    orderId: string
    closedAt?: Date
    createdAt: Date,
    updatedAt: Date,
}

export const OrderRoomSettings: Schema = new Schema({
    cId: {type: Schema.Types.ObjectId, required: true, ref: "user", index: 1},
    pId: {type: Schema.Types.ObjectId, required: true, ref: "user", index: 1},
    orderId: {type: String, required: true,},
    pinData: {type: Object, default: null},
    orderTitle: {type: String, default: null},
    orderImage: {type: String, default: null},
    closedAt: {type: Date, default: null},
    updatedAt: {type: Date, select: false}
}, {
    timestamps: true,
     

});
