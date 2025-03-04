/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";
import {BaseUser} from "../../../core/utils/interfaceces";
import pM from "mongoose-paginate-v2";

export interface IBroadcastMember extends Document {
    _id: string;
    uId: string;
    //this is the single chat room id
    rId: string;
    // this is the broadcast id
    bId: string;
    userData: BaseUser
    createdAt: Date,
}

export const BroadcastMemberSchema: Schema = new Schema({
    //user id
    uId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    // roomId
    rId: {type: Schema.Types.ObjectId, required: true},
    // broadcast id
    bId: {type: Schema.Types.ObjectId, required: true},
    // userName
    userData: {type: Object, required: true},
    updatedAt: {type: Date, select: false}
}, {
    timestamps: true,
     
});
BroadcastMemberSchema.index({rId: 1, uId: 1, bId: 1}, {unique: true});
BroadcastMemberSchema.plugin(pM)