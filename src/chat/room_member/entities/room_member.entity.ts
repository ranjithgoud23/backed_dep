/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from "mongoose";
import { RoomType } from "../../../core/utils/enums";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

//todo add is from support and
//todo add is anonymous
export interface IRoomMember extends Document {
    // userId
    uId: string;
    //roomId
    rId: string;
    //lastSeenMessageId
    lSMId: string;
    //roomType
    rT: RoomType;
    //title
    t: string;
    //translatedTo
    tTo?: string,
    //title English
    tEn: string;
    //nick title
    nTitle: string;
    //image
    img: string,
    // isDeleted
    isD: boolean,
    // isArchived
    isA: boolean,
    // isMuted
    isM: boolean,
    //peerID
    pId?: string,
    orderId?: string,
    createdAt: Date,
    updatedAt: Date,
    isOneSeen:boolean

}

export const RoomMemberSchema: Schema = new Schema({
    // userId
    uId: {type: Schema.Types.ObjectId, required: true, index: 1, ref: "User"},
    //roomId
    rId: {type: Schema.Types.ObjectId, required: true},
    //lastSeenMessageId
    lSMId: {type: Schema.Types.ObjectId, required: true},
    //roomType
    rT: {type: String, enum: Object.values(RoomType), required: true},
    //title
    t: {type: String, required: true},
    tEn: {type: String, required: true},
    //nick title
    nTitle: {type: String, default: null},
    //thumbImage
    img: {type: String, default: null},
    // isDeleted
    isD: {type: Boolean, default: false},
    isOneSeen: {type: Boolean, default: false},
    // isArchived
    isA: {type: Boolean, default: false},
    // isMuted
    isM: {type: Boolean, default: false},
    //translatedTo
    tTo: {type: String, default: null},
    /// **for single chat only**
    //peerID
    pId: {type: Schema.Types.ObjectId, default: null},
    orderId: {type: String, default: null},
    // //blockerId
    // bId: {type: Schema.Types.ObjectId, default: null},
    updatedAt: {type: Date, select: false}
}, {
    timestamps: true,
     

});
RoomMemberSchema.index({rId: 1, uId: 1}, {unique: true})
RoomMemberSchema.plugin(aggregatePaginate);
RoomMemberSchema.index({rId:1});
RoomMemberSchema.index({rT:1});
RoomMemberSchema.index({lSMId:1});
