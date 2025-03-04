/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {ReportSystemService} from './report_system.service';
import {ReportSystemController} from './report_system.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {ReportSchema} from "./entities/report_system.entity";

@Module({
    controllers: [ReportSystemController],
    providers: [ReportSystemService],
    exports: [ReportSystemService],
    imports: [
        MongooseModule.forFeature([{
            name: "reports",
            schema: ReportSchema
        }])
    ]
})
export class ReportSystemModule {
}
