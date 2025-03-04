/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IsNotEmpty} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";


export class CreateBroadcastRoomDto extends CommonDto {
    @IsNotEmpty()
    peerIds: any;


    @IsNotEmpty()
    broadcastName: string;

    imageBuffer?: Buffer;

    imgUrl ;

}
