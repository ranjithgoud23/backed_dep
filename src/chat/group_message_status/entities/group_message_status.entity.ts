/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";
 import pM from "mongoose-paginate-v2";


export interface IGroupMessageStatus extends Document {
    //message id
    mId: string
    //roomId
    rId: string
    //room id
    // rId: string
    //user id
    uId: string
    //userData: BaseUser
    //delivered at
    dAt?: Date
    //seen at
    sAt?: Date
    //created at
    cAt: Date
}

export const GroupMessageStatusSchema: Schema = new Schema({
    mId: {type: Schema.Types.ObjectId, required: true},
    rId: {type: Schema.Types.ObjectId, required: true},
    // rId: {type: Schema.Types.ObjectId, required: true},
    uId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
    // userData: {type: Object, required: true},
    dAt: {type: Date, default: null},
    sAt: {type: Date, default: null},
    cAt: {type: Date, default: new Date()},
}, {
    timestamps: false,
     
});
// GroupMessageStatusSchema.index({mId: 1, uId: 1}, {unique: true})
GroupMessageStatusSchema.plugin(pM)