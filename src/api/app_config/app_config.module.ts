/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { AppConfigService } from './app_config.service';
import {MongooseModule} from "@nestjs/mongoose";
import {UserModule} from "../user_modules/user/user.module";
import {AppConfigSchema} from "./entities/app_config.entity";

@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
  imports:[
    MongooseModule.forFeature([{
      name: "app_config",
      schema: AppConfigSchema
    }]),
    UserModule
  ]

})
export class AppConfigModule {}
