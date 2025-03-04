/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IUser} from "../../../api/user_modules/user/entities/user.entity";
import {IsDateString, IsNotEmpty} from "class-validator";

export default class CommonDto {
    myUser: IUser
}

export class DateRangeDto {
    constructor(args: { startDate: Date, endDate: Date, }) {
        this.startDate = args.startDate.toDateString()
        this.endDate = args.endDate.toDateString()
    }

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;
}