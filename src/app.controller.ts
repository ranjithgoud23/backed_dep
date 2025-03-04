/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Controller, Get, Query, Res} from "@nestjs/common";
import {join} from "path";
 import {ConfigService} from "@nestjs/config";

@Controller()
export class AppController {

    constructor(
        private readonly configService: ConfigService
    ) {
    }

    @Get("privacy-policy")
    servePrivacyPolicy(@Res() res) {

        return res.sendFile(join(process.cwd(), "public/privacy-policy.html"));
    }

    @Get()
    getHello(@Res() res): string {
        return res.sendFile(join(process.cwd(), "public/home.html"));
    }

}
