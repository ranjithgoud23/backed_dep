/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {BaseService} from "../../core/common/base.service";
import {ICountry} from "./countries.entity";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";

@Injectable()
export class CountriesService extends BaseService<ICountry> {

    constructor(
        @InjectModel("countries") private readonly model: PaginateModel<ICountry>,
    ) {
        super()
    }

    create(obj: Partial<ICountry>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }



    deleteMany(filter: FilterQuery<ICountry>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    deleteOne(filter: FilterQuery<ICountry>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(
        filter?: FilterQuery<ICountry> | undefined,
        select?: string | null | undefined,
        options?: QueryOptions<ICountry> | null | undefined,
    ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(
        id: string,
        select?: string,
    ): Promise<ICountry | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndDelete(id));
    }

    findByIdAndUpdate(
        id: string,
        update: UpdateQuery<ICountry>,
    ): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    estimatedDocumentCount(): Promise<any> {
        return Promise.resolve(this.model.estimatedDocumentCount());
    }

    updateMany(
        filter: FilterQuery<ICountry>,
        update: UpdateQuery<ICountry>,
        options?: QueryOptions<ICountry> | null | undefined,
    ): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(
        id: string,
        select?: string | null | undefined,
    ): Promise<ICountry> {
        let m = await this.findById(id, select);
        if (!m)
            throw new NotFoundException(
                'country with id ' + id + ' not found in db',
            );
        return m;
    }

    findByRoomId(
        roomId: string,
        select?: string | null | undefined,
        options?: QueryOptions<ICountry> | null | undefined,
    ) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(
        roomId: string,
        filter: FilterQuery<ICountry>,
    ): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }


    findOne(
        filter: FilterQuery<ICountry>,
        select?: string,
    ): Promise<ICountry | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    createMany(obj: Array<Partial<ICountry>>, session?): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(
        filter: FilterQuery<ICountry>,
        update: UpdateQuery<ICountry>,
        session?,
        options?: QueryOptions<ICountry>,
    ): Promise<ICountry | null> {
        return Promise.resolve(
            this.model.findOneAndUpdate(filter, update, options).session(session),
        );
    }

    findCount(filter: FilterQuery<ICountry>, session?): Promise<any> {
        return Promise.resolve(this.model.estimatedDocumentCount(filter).session(session),);
    }
}
