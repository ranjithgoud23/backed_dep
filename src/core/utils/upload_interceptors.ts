/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {FileInterceptor} from "@nestjs/platform-express";
import {BadRequestException} from "@nestjs/common";
import { whitelistImages } from "./constants";

export const imageFileInterceptor = FileInterceptor('file', {
    limits: {
        fileSize:  25 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (req: Request, file, cb) => {
        if (!whitelistImages.includes(file.mimetype)) {
            return cb(new BadRequestException('Image extension not allowed'), false);
        }
        return cb(null, true);
    },
})