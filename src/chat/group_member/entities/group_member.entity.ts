/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Document, Schema} from 'mongoose';
 import {BaseUser} from "../../../core/utils/interfaceces";
import pM from "mongoose-paginate-v2";
import {BroadcastMemberSchema} from "../../broadcast_member/entities/broadcast_member.entity";
import {GroupRoleType} from "../../../core/utils/enums";


export interface IGroupMember extends Document {
    // user id
    uId: string;
    // room id
    rId: string;

    userData:BaseUser
    // group role for this user
    gR: GroupRoleType;
    createdAt: Date;
}

export const GroupMemberSchema: Schema = new Schema(
    {
        uId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
        rId: {type: Schema.Types.ObjectId, required: true},
        //group Role
        gR: {
            type: String,
            default: GroupRoleType.Member,
            enum: [
                GroupRoleType.Member,
                GroupRoleType.Admin,
                GroupRoleType.SuperAdmin,
            ],
        },
        userData: {type: Object, required: true},
         // lMBBlock: { type: Schema.Types.ObjectId, default: null },
        updatedAt: {type: Date, select: false}
    },
    {
        timestamps: true,

    },
);
GroupMemberSchema.plugin(pM)