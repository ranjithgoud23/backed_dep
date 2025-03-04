/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {Schema} from "mongoose";
import pM from "mongoose-paginate-v2";
import {ChatRequestStatus, RoomType} from "../../../core/utils/enums";
import {RoomMemberSchema} from "../../room_member/entities/room_member.entity";



export interface IChatRequest extends Document {
    senderId: string
    _id: string
    receiverId: string
    roomId: string
    roomType: RoomType
    status: ChatRequestStatus
}

export const ChatRequestSchema: Schema = new Schema(
    {
        senderId: {type: Schema.Types.ObjectId, required: true, index: 1, ref: "User"},
        receiverId: {type: Schema.Types.ObjectId, required: true, index: 1, ref: "User"},
        roomId: {type: Schema.Types.ObjectId, required: true},
        roomType: {type: String, enum: Object.values(RoomType), required: true, index: 1},
        status: {type: String, enum: Object.values(ChatRequestStatus), required: true},
    },
    {
        timestamps: true,
    },
);
ChatRequestSchema.index({senderId: 1, receiverId: 1, roomId: 1}, {unique: true})
ChatRequestSchema.plugin(pM)