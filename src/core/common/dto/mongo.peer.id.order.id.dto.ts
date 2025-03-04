/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "./common.dto";
import {Allow, IsMongoId, IsNotEmpty} from "class-validator";
import { MongoPeerIdDto } from "./mongo.peer.id.dto";

export class CreateOrderRoomDto extends MongoPeerIdDto {
    @IsNotEmpty()
    orderId: string;
    @Allow()
    orderImage?: string
    @Allow()
    orderTitle?: string
    @Allow()
    orderData?: any;
}