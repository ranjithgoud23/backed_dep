/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, Logger} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {MailerService} from "@nestjs-modules/mailer";
import {SendMailEvent} from "../../core/utils/interfaceces";
import {MailType} from "../../core/utils/enums";
import {AppConfigService} from "../app_config/app_config.service";

@Injectable()
export class MailEvent {
    private readonly logger = new Logger(MailEvent.name);

    constructor(
        private mailerService: MailerService,
        private appConfig: AppConfigService,
    ) {
    }


    @OnEvent("send.mail")
    async handleOrderCreatedEvent(event: SendMailEvent) {
        let appConfig = await this.appConfig.getConfig();
        try {
            if (event.mailType == MailType.ResetPassword) {
                this.mailerService.sendMail({
                    to: event.user.email,
                    subject: appConfig.appName,
                    template: "./password_reset",
                    context: {
                        name: event.user.fullName,
                        code: event.code,
                        appName: appConfig.appName,
                    }
                }).then(value => {
                });
            } else {
                await this.mailerService.sendMail({
                    to: event.user.email,
                    subject: appConfig.appName,
                    template: "./confirmation",
                    context: {
                        name: event.user.fullName,
                        code: event.code,
                        appName: appConfig.appName
                    }
                }).then(value => {
                });
            }

        } catch (e) {
            this.logger.error(e);
        }
    }
}