/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import pM from "mongoose-paginate-v2"
import {
    MailType,
    RegisterMethod,
    RegisterStatus,
    UserPrivacyTypes,
    UserRole,
    UserType
} from "../../../../core/utils/enums";
import {IUserDevice} from "../../user_device/entities/user_device.entity";
import {UserGlobalCallStatus} from "../../../../chat/call_modules/utils/user-global-call-status.model";

export interface IUser {
    _id: string
    email: string;
    fullName: string;
    fullNameEn: string;
    password: string,
    uniqueCode: number,
    bio?: string,
    lastMail: {
        type: MailType,
        sendAt: Date,
        code: number,
        expired: boolean
    },
    banTo?: Date,
    verifiedAt?: Date,
    registerStatus: RegisterStatus,
    registerMethod: RegisterMethod,
    userImage: string,
    createdAt: Date,
    deletedAt?: Date,
    countryId?: string,
    updatedAt: Date,
    lastSeenAt: Date,
    roles: UserRole[]
    userPrivacy: UserPrivacy
    //not saved in db
    currentDevice: IUserDevice
    userGlobalCallStatus?: UserGlobalCallStatus,

}

export interface UserPrivacy {
    startChat: UserPrivacyTypes
    publicSearch: boolean
    showStory: UserPrivacyTypes
    lastSeen: boolean
}

export const UserSchema = new mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        fullName: {type: String, required: true},
        fullNameEn: {type: String, required: true},
        bio: {type: String, default: null},
        userGlobalCallStatus: {type: Object, default: UserGlobalCallStatus.createEmpty()},
        uniqueCode: {type: Number, required: true},
        password: {type: String, required: true, select: false},
        lastMail: {type: Object, default: {}},
        verifiedAt: {type: Date, default: null},
        userImage: {type: String, default: "default_user_image.png"},
        registerStatus: {
            type: String,
            enum: Object.values(RegisterStatus),
            required: true
        },
        registerMethod: {
            type: String,
            enum: Object.values(RegisterMethod),
            required: true
        },
        roles: {
            type: [String], // Define as an array of strings
            default: [],
            enum: Object.values(UserRole), // Ensure UserRole values are strings
        },
        banTo: {type: Date, default: null},
        countryId: {type: Schema.Types.ObjectId, default: null, ref: "countries"},
        createdAt: {type: Date,},
        deletedAt: {type: Date, default: null,},

        userPrivacy: {
            type: Object,
            default: {
                startChat: UserPrivacyTypes.ForReq,
                publicSearch: true,
                showStory: UserPrivacyTypes.ForReq,
                lastSeen: true,
            }
        },
        lastSeenAt: {type: Date, default: Date.now},
        updatedAt: {type: Date}
    },
    {
        timestamps: true
    }
);

UserSchema.pre("save", async function (next) {
    let user = this;
    if (!user.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hashSync(user.password, salt);
    return next();
});
UserSchema.pre("findOneAndUpdate", async function (next) {
    let user: any = this.getUpdate();

    if (!user || !user.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hashSync(user.password, salt);
    // important to use '$set', so that you are instructing mongoose to update the specific fields
    this.findOneAndUpdate({}, {$set: user});
    return next();
});
UserSchema.plugin(pM)

// export const UserEntity = mongoose.model<IUser>("User", userSchema);

