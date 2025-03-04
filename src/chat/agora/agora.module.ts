/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {AgoraService} from './agora.service';
import {ConfigModule} from "@nestjs/config";
import {UserModule} from "../../api/user_modules/user/user.module";

@Module({
    exports: [AgoraService],
    providers: [AgoraService],
    imports:[
        ConfigModule,
        UserModule
    ]
})
export class AgoraModule {
}
