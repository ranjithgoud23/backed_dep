/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";
 import {RegisterStatus} from "../../../core/utils/enums";
import {VRoomsIcon} from "../../../core/utils/interfaceces";
import {version} from '../../../../package.json';

export interface IAppConfig {
    _id: string,
    configVersion: number,
    enableAds: boolean,
    feedbackEmail: string,
    allowWebLogin: boolean,
    allowMobileLogin: boolean,
    allowCreateGroup: boolean,
    allowCreateBroadcast: boolean,
    allowMessaging: boolean,
    allowSendMedia: boolean,
    allowDesktopLogin: boolean,
    privacyUrl: string,
    googlePayUrl: string,
    webChatUrl: string,
    windowsStoreUrl: string,
    macStoreUrl: string,
    appleStoreUrl: string,
    appName: string,
    //for password recovery
    maxExpireEmailTime: number,
    userRegisterStatus: RegisterStatus,
    ///v chat
    callTimeout: number,
    maxGroupMembers: number
    maxBroadcastMembers: number
    maxChatMediaSize: number
    backendVersion?: string
    maxForward: number
    allowCall: boolean
    roomIcons: VRoomsIcon,
    groupIcon: string,
    supportIcon: string,
    broadcastIcon: string,
    userIcon: string,
}

export const AppConfigSchema = new mongoose.Schema(
    {
        configVersion: {type: Number, default: 1},
        backendVersion: {type: String,default:"1.0.0" },
        enableAds: {type: Boolean, default: true},
        feedbackEmail: {type: String, default: "vchatsdk@gmail.com"},
        allowWebLogin: {type: Boolean, default: true},
        allowMobileLogin: {type: Boolean, default: true},
        allowCreateGroup: {type: Boolean, default: true},
        ///change this by your app name
        appName: {type: String, default: "Super up"},
        allowCreateBroadcast: {type: Boolean, default: true},
        allowDesktopLogin: {type: Boolean, default: true},
        privacyUrl: {type: String, default: "https://api.superupdev.online/privacy-policy"},
        googlePayUrl: {type: String, default: null},
        webChatUrl: {type: String, default: null},
        windowsStoreUrl: {type: String, default: null},
        macStoreUrl: {type: String, default: null},
        appleStoreUrl: {type: String, default: null},
        maxExpireEmailTime: {type: Number, default: 5}, //5 minutes for rest password
        userRegisterStatus: {type: String, default: RegisterStatus.accepted},
        userIcon: {type: String, default: "default_user_image.png"},
        ///v chat
        callTimeout: {type: Number, default: 60000},
        roomIcons: {
            type: Object, default: {
                group: "👥",
                order: "💬",
                broadcast: "📢"
            }
        },
        allowMessaging: {type: Boolean, default: true},
        allowSendMedia: {type: Boolean, default: true},
        maxGroupMembers: {type: Number, default: 512},
        maxBroadcastMembers: {type: Number, default: 512},
        maxForward: {type: Number, default: 10},
        maxChatMediaSize: {type: Number, default: 1024 * 1024 * 100},// 100 mbs
        allowCall: {type: Boolean, default: true},
        groupIcon: {type: String, default: "default_group_image.png"},
        supportIcon: {type: String, default: "default_support_image.png"},
        broadcastIcon: {type: String, default: "default_broadcast_image.png"}
    },
    {
        timestamps: true
    }
);
