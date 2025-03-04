/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {Schema} from "mongoose";
 import {StoryFontType, StoryPrivacy, StoryType} from "../../../../core/utils/enums";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import {RoomMemberSchema} from "../../../../chat/room_member/entities/room_member.entity";

export interface IStory extends Document {
    userId: string;
    storyType: StoryType
    storyPrivacy?: StoryPrivacy
    fontType: StoryFontType
    content?: string
    att?: object
    backgroundColor?: string
    textAlign?: string
    textColor?: string
    caption?: string
    somePeople?: any[]
    views: any[]
    createdAt: Date;
    expireAt: Date;
}

export const StorySchema: Schema = new Schema(
    {
        userId: {type: Schema.Types.ObjectId, required: true, ref: 'user', index: 1},
        content: {type: String, default: null},
        backgroundColor: {type: String, default: null},
        textAlign: {type: String, default: null},
        textColor: {type: String, default: null},
        caption: {type: String, default: null},
        storyType: {type: String, default: StoryType.Text},
        storyPrivacy: {type: String, default: StoryPrivacy.Public},
        somePeople: {type: [Schema.Types.ObjectId], default: []},
        fontType: {type: String, default: StoryFontType.Normal},
        views: {type: [], default: []},
        att: {
            type: Object,
            default: null
        },
        updatedAt: {type: Date, select: false},
        createdAt: {type: Date},
        expireAt: {type: Date, index: 1}
    },
    {
        timestamps: true,
    },
);
StorySchema.plugin(aggregatePaginate);
StorySchema.index({somePeople:1});