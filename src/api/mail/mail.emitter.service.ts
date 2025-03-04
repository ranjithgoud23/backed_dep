/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import date from "date-and-time";
import {EventEmitter2} from "@nestjs/event-emitter";
import {IUser} from "../user_modules/user/entities/user.entity";
import {MailType} from "../../core/utils/enums";
import {SendMailEvent} from "../../core/utils/interfaceces";
import {i18nApi} from "../../core/utils/res.helpers";

@Injectable()
export class MailEmitterService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
    ) {
    }

    async sendConfirmEmail(user: IUser, mailType: MailType, isDev: boolean) {
        let code = Math.floor(100000 + Math.random() * 900000);
        if (isDev) {
            return code
        }
        if (user.lastMail && user.lastMail.sendAt) {
            let min = parseInt(date.subtract(new Date(), user.lastMail.sendAt).toMinutes().toString(), 10);
            if (min < 2) {
                throw new BadRequestException(i18nApi.wait2MinutesToSendMail);
            }
        }

        let x = new SendMailEvent();
        x.code = code.toString();
        x.user = user;
        x.mailType = mailType;
        this.eventEmitter.emit("send.mail", x);
        return code;
    }
}
