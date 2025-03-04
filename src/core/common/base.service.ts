/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
} from "mongoose";

export abstract class BaseService<IM> {
    abstract create(obj: Partial<IM>, session?): Promise<any>
    abstract createMany(obj: Array<Partial<IM>>, session?): Promise<any>
    abstract findById(id: string, select?: string | null): Promise<IM | null>

    abstract findOne(filter: FilterQuery<IM>, select?: string | null): Promise<IM | null>
    abstract findOneAndUpdate(filter: FilterQuery<IM>, update: UpdateQuery<IM>, session?, options?: QueryOptions<IM> | null): Promise<IM | null>

    abstract findByIdOrThrow(id: string, select?: string | null): Promise<IM>

    abstract findByIdAndUpdate(id: string, update: UpdateQuery<IM> | null, session?): Promise<any>

    abstract updateMany(filter: FilterQuery<IM>, update: UpdateQuery<IM>, session?, options?: QueryOptions<IM> | null): Promise<any>

    abstract findAll(filter?: FilterQuery<IM>, select?: string | null, options?: QueryOptions<IM> | null): Promise<any>

    abstract findByIdAndDelete(id: string, session?): Promise<any>
    abstract deleteMany(filter: FilterQuery<IM>, session?): Promise<any>
    abstract findCount(filter: FilterQuery<IM>, session?): Promise<any>
}