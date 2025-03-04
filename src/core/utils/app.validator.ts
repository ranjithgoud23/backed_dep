/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {validate, validateOrReject} from "class-validator";
import {BadRequestException} from "@nestjs/common";
import crypto from "crypto";

export function jsonDecoder(data: string) {
    try {
        return JSON.parse(data);
    } catch (e) {
        throw new BadRequestException("Not valid json data " + data);
    }
}


export async function appValidator(dto: any) {
        await validateOrReject(dto, {
            enableDebugMessages: false,
            forbidNonWhitelisted: true,
            whitelist: true,
            stopAtFirstError: true
        });
}