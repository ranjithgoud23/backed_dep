/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "../user_modules/user/user.module";
import { UserDeviceModule } from "../user_modules/user_device/user_device.module";
import { AppConfigModule } from "../app_config/app_config.module";
import { TokenType } from "../../core/utils/enums";
import { UserCountryModule } from "../user_modules/user_country/user_country.module";
import { FileUploaderModule } from "../../common/file_uploader/file_uploader.module";
import { NotificationEmitterModule } from "../../common/notification_emitter/notification_emitter.module";
import {MailEmitterModule} from "../mail/mail.emitter.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (args: ConfigService) => {
        return {
          secret: args.getOrThrow("JWT_SECRET"),
          signOptions: {
            expiresIn: 1866240000000,
            subject: TokenType.Access,
            issuer: args.getOrThrow("issuer"),
            algorithm: "HS256",
            audience: args.getOrThrow("audience")
          }
        };
      },
      inject: [ConfigService]
    }),
    FileUploaderModule,
    UserModule,
    UserCountryModule,
    AppConfigModule,
    UserDeviceModule,
    NotificationEmitterModule,
    MailEmitterModule,
  ]
})
export class AuthModule {
}
