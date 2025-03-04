/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {MailType} from "./enums";
import { IUser } from "../../api/user_modules/user/entities/user.entity";


export class PushKeyAndProvider{

    fcm:any[]
    oneSignal:any[]
    voipKeys:any[]

    constructor(fcm: any[], oneSignal: any[],voipKeys:any[]) {
        this.fcm = fcm;
        this.oneSignal = oneSignal;
        this.voipKeys = voipKeys;
    }
}
export class SendMailEvent {
    text: string;
    code: string;
    user: IUser;
    mailType: MailType;
}
export interface BaseUser {
    _id: string
    fullName: string
    fullNameEn: string
    userImage: string
}


export interface JwtDecodeRes {
    userId: string,
    deviceId: string
}
export interface VRoomsIcon {
    group: string,
    broadcast: string
    order: string
}