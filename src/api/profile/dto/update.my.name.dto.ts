/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IsBoolean, IsEnum, IsNotEmpty} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";
import {ChatRequestStatus, UserPrivacyTypes} from "../../../core/utils/enums";


export class UpdateMyNameDto extends CommonDto {
    @IsNotEmpty()
    fullName: string
}
export class UpdateMyPrivacyDto extends CommonDto {
    @IsEnum(UserPrivacyTypes)
    startChat: UserPrivacyTypes

    @IsBoolean()
    publicSearch: boolean

    @IsBoolean()
    lastSeen: boolean

    @IsEnum(UserPrivacyTypes)
    showStory: UserPrivacyTypes
}
export class UpdateChatReqStatusDto extends CommonDto {
    @IsEnum(ChatRequestStatus)
    status: ChatRequestStatus
}

export class UpdateMyBioDto extends CommonDto {
    @IsNotEmpty()
    bio: string
}

export class UpdateMyPasswordDto extends CommonDto {
    @IsNotEmpty()
    oldPassword: string
    @IsNotEmpty()
    newPassword: string

    @IsNotEmpty()
    newConfPassword: string

    @IsBoolean()
    logoutAll: boolean
}