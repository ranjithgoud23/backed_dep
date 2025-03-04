/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BaseService} from "./base.service";
import {
    FilterQuery,
    QueryOptions,
    UpdateQuery,
} from "mongoose";

export abstract class BaseRoomService<RM> extends BaseService<RM> {
    abstract findByRoomId(roomId: string, select?: string | null, options?: QueryOptions<RM> | null): Promise<any>

    abstract findByRoomIdAndUpdate(roomId: string, update: Partial<RM>, session?): Promise<any>

    abstract findByRoomIdAndDelete(roomId: string, filter: FilterQuery<RM>, session?): Promise<any>
}