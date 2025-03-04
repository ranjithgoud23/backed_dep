/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */


import {Allow, IsNotEmpty, IsObject} from "class-validator";
import CommonDto from "../../../core/common/dto/common.dto";


export class CreateGroupRoomDto extends CommonDto {

  @IsNotEmpty()
  peerIds: any;

  @Allow()
  extraData?:any

  @IsNotEmpty()
  groupName: string;

  @Allow()
  groupDescription?: string;

  imageBuffer?: Buffer;

  imgUrl :string;

}
