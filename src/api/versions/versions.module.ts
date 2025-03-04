/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { VersionsService } from './versions.service';
import {MongooseModule} from "@nestjs/mongoose";
import {CountrySchema} from "../countries/countries.entity";
import {VersionSchema} from "./versions.entity";

@Module({
  providers: [VersionsService],
  exports: [VersionsService],
  imports: [
    MongooseModule.forFeature([{
      name: "versions",
      schema: VersionSchema
    }]),
  ]
})
export class VersionsModule {}
