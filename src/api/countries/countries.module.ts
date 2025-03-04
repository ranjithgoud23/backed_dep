/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {CountriesService} from './countries.service';
import {MongooseModule} from "@nestjs/mongoose";
import {CountrySchema} from "./countries.entity";

@Module({
    providers: [CountriesService],
    exports: [CountriesService],
    imports: [
        MongooseModule.forFeature([{
            name: "countries",
            schema: CountrySchema
        }]),
    ]
})
export class CountriesModule {
}
