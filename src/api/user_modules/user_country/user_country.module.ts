/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { UserCountryService } from './user_country.service';
import {MongooseModule} from "@nestjs/mongoose";
import {CountrySchema} from "../../countries/countries.entity";
import {UserCountrySchema} from "./countries.entity";
import {CountriesModule} from "../../countries/countries.module";

@Module({
   providers: [UserCountryService],
   exports: [UserCountryService],
   imports:[
      MongooseModule.forFeature([{
         name: "user_country",
         schema: UserCountrySchema
      }]),
       CountriesModule
   ]
})
export class UserCountryModule {}
