/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "./common.dto";
import {IsMongoId} from "class-validator";
import {IUser} from "../../../api/user_modules/user/entities/user.entity";

export class MongoPeerIdDto extends CommonDto {
    ///create constructor
    constructor(peerId: string, myUser: IUser) {
        super();
        this.peerId = peerId;
        this.myUser = myUser;
    }

    @IsMongoId()
    peerId: string;
}