/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from '@nestjs/common';
import {RoomMiddlewareService} from './room_middleware.service';
import { RoomMemberModule } from "../room_member/room_member.module";
import { SingleRoomSettingsModule } from "../single_room_settings/single_room_settings.module";


@Module({
    providers: [RoomMiddlewareService],
    exports: [RoomMiddlewareService],
    imports: [
        RoomMemberModule,
        SingleRoomSettingsModule,

    ]
})
export class RoomMiddlewareModule {
}
