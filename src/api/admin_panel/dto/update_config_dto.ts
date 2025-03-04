/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {RegisterStatus} from "../../../core/utils/enums";
import {VRoomsIcon} from "../../../core/utils/interfaceces";
import {Allow, IsBoolean, IsEnum, ValidateIf} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";

export class UpdateConfigDto extends CommonDto {



    @Allow()
    @ValidateIf(object => object['enableAds'])
    @IsBoolean()
    enableAds: boolean;

    @Allow()
    approveMessage: string;

    @Allow()
    appName: string;


    @Allow()
    pendingMessage: string;


    @Allow()
    feedbackEmail: string;

    @Allow()
    shareAppMessage: string;



    @Allow()
    @ValidateIf(object => object['allowWebLogin'])
    @IsBoolean()
    allowWebLogin: boolean;

    @Allow()
    @ValidateIf(object => object['allowMobileLogin'])
    @IsBoolean()
    allowMobileLogin: boolean;



    @Allow()
    @ValidateIf(object => object['allowCreateGroup'])
    @IsBoolean()
    allowCreateGroup: boolean;

    @Allow()
    @ValidateIf(object => object['allowCreateBroadcast'])
    @IsBoolean()
    allowCreateBroadcast: boolean;

    @Allow()
    @ValidateIf(object => object['allowDesktopLogin'])
    @IsBoolean()
    allowDesktopLogin: boolean;

    @Allow()
    privacyUrl: string;

    @Allow()
    googlePayUrl: string;

    @Allow()
    appleStoreUrl: string;

    @Allow()
    macStoreUrl: string;
    @Allow()
    webChatUrl: string;
    @Allow()
    windowsStoreUrl: string;

    @Allow()
    maxExpireEmailTime: number;

    @Allow()
    @ValidateIf((o) => o.userRegisterStatus)
    @IsEnum(RegisterStatus)
    userRegisterStatus: RegisterStatus;

    // v chat

    @Allow()
    callTimeout: number;

    @Allow()
    maxGroupMembers: number;

    @Allow()
    maxBroadcastMembers: number;

    @Allow()
    maxChatMediaSize: number;

    @Allow()
    @ValidateIf(object => object['allowCall'])
    @IsBoolean()
    allowCall: boolean;

    @Allow()
    @ValidateIf(object => object['allowMessaging'])
    @IsBoolean()
    allowMessaging: boolean;

    @Allow()
    @ValidateIf(object => object['allowSendMedia'])
    @IsBoolean()
    allowSendMedia: boolean;

    @Allow()
    maxForward: number;


    backendVersion:string
}