/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { BanService } from "./ban.service";
import { MongooseModule } from "@nestjs/mongoose";
import { BanSchema } from "./entities/ban.entity";

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: "ban",
      schema: BanSchema
    }])
  ],
  providers: [BanService],
  exports: [BanService]
})
export class BanModule {
}
