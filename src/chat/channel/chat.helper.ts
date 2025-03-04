/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";
 import {v4 as uuidv4} from 'uuid';
import { BaseUser } from "../../core/utils/interfaceces";
import { MessageType } from "../../core/utils/enums";
import { IUser } from "../../api/user_modules/user/entities/user.entity";
import { SendMessageDto } from "./dto/send.message.dto";

export interface OneFullRoomModel {
    roomId: string,
    userId: string,
    deleteIsDKey?: boolean
    filter?: {}
}

export interface getChannelType {
    filter: {}
    myIdObj: mongoose.Types.ObjectId,
    limit: number,
    page: number,
}

// export function getChannelStages(dto: getChannelType): any[] {
//     return [
//         {
//             $match: dto.filter,
//         },
//         {
//             $lookup: {
//                 from: 'messages',
//                 localField: 'rId',
//                 foreignField: 'rId',
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $not: {
//                                     $in: [dto.myIdObj, '$dF'],
//                                 },
//                             },
//                         },
//                     },
//                     {
//                         $sort: {
//                             _id: -1,
//                         },
//                     },
//                     {
//                         $limit: 1,
//                     },
//                 ],
//                 as: 'messages',
//             },
//         },
//         {
//             $sort: {
//                 'messages._id': -1,
//             },
//         },
//     ];
// }


export function getMsgDtoObj(dto: {
    localId?: string,
    _pBId?: string,
    _id?: string,
    peerData?: BaseUser,
    mT: MessageType,
    rId: string,
    user: IUser,
    content: string,
    att: {}
}):SendMessageDto {
    let obj = new SendMessageDto()
    obj.messageType = dto.mT
    obj.content = dto.content;
    obj.myUser = dto.user
    obj._id = dto._id
    obj._pBId = dto._pBId
    obj._peerData = dto.peerData
    obj._platform = dto.user.currentDevice.platform
    obj._messageAttachment = dto.att
    obj.localId = dto.localId ?? uuidv4()
    obj._roomId = dto.rId
    obj.isOneSeen = false
    return obj
}
