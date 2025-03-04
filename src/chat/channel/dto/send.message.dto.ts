/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Allow, IsBoolean, IsBooleanString, IsEnum, IsJSON, IsNotEmpty, IsUUID, ValidateIf} from "class-validator";
import {MessageType} from "../../../core/utils/enums";
import CommonDto from "../../../core/common/dto/common.dto";
import {BaseUser} from "../../../core/utils/interfaceces";
import {IMessage} from "../../message/entities/message.entity";
import {jsonDecoder} from "../../../core/utils/app.validator";


export class SendMessageDto extends CommonDto {


    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    @IsUUID()
    localId: string;

    @IsEnum(MessageType)
    messageType: MessageType;

    @Allow()
    @ValidateIf(object => object["isEncrypted"])
    @IsBooleanString()
    isEncrypted?: string;

    @Allow()
    @ValidateIf(attachmentValidation)
    @IsJSON()
    attachment?: string

    @Allow()
    @ValidateIf(object => object['linkAtt'])
    @IsJSON()
    linkAtt?: string

    @Allow()
    @ValidateIf(object => object["forwardLocalId"])
    @IsUUID()
    forwardLocalId?: string;

    @Allow()
    @ValidateIf(object => object['replyToLocalId'])
    @IsUUID()
    replyToLocalId?: string;

    isOneSeen:boolean
    _roomId: string;
    _mediaFile?: any;
    _secondMediaFile?: any;
    _replyTo?: string;
    _messageAttachment?: {};
    _platform: string;
    mentions: any[];
    _peerData?: BaseUser
    //to broadcast only
    _id?: string
    //to broadcast only
    _pBId?: string

    toJson() {
        let x: Partial<IMessage> = {
            _id: this._id,
            sId: this.myUser._id,
            sName: this.myUser.fullName,
            sImg: this.myUser.userImage,
            plm: this._platform,
            rId: this._roomId,
            isOneSeen: this.isOneSeen,
            forId: this.forwardLocalId,
            linkAtt: this.linkAtt ? JSON.parse(this.linkAtt) : null,
            c: this.content,
            mT: this.messageType,
            mentions: this.mentions,
            isEncrypted: this.isEncrypted == "true",
            pBId: this._pBId,
            rTo: this._replyTo ? jsonDecoder(this._replyTo) : null,
            msgAtt: this._messageAttachment,
            lId: this.localId,
            peerData: this._peerData ? {...this._peerData} : null
        }
        return x;
    }

    isImage() {
        if (this.messageType == MessageType.Image) {
            return true
        }
    }

    isVideo() {
        if (this.messageType == MessageType.Video) {
            return true
        }
    }

    isVoice() {
        if (this.messageType == MessageType.Voice) {
            return true
        }
    }

    isFile() {
        if (this.messageType == MessageType.File) {
            return true
        }
    }

    isText() {
        if (this.messageType == MessageType.Text) {
            return true
        }
    }

    isLocation() {
        if (this.messageType == MessageType.Location) {
            return true
        }
    }

    isInfo() {
        if (this.messageType == MessageType.Info) {
            return true
        }
    }

    isEncryptedMessage() {
        return this.isEncrypted;
    }

    isCustom() {
        if (this.messageType == MessageType.Custom) {
            return true
        }
    }

    isRequireFile() {
        if (this.forwardLocalId) {
            return false;
        }
        return this.isImage() || this.isFile() || this.isVoice() || this.isVideo()
    }

    isRequireAttachment() {
        return this.isVideo() || this.isLocation() || this.isVoice()
    }


}

function attachmentValidation(object) {
    let mT = object["messageType"] as String
    return mT == MessageType.Video ||
        mT == MessageType.Location ||
        mT == MessageType.Custom ||
        mT == MessageType.Voice
}