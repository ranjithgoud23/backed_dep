/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
import {BaseService} from "../../../core/common/base.service";
import {IUserCountry} from "./countries.entity";
import {CountriesService} from "../../countries/countries.service";
import {newMongoObjId} from "../../../core/utils/utils";

@Injectable()
export class UserCountryService extends BaseService<IUserCountry> {

    constructor(
        @InjectModel("user_country") private readonly model: PaginateModel<IUserCountry>,
        private readonly countryService: CountriesService
    ) {
        super()
    }

    create(obj: Partial<IUserCountry>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IUserCountry>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    deleteOne(filter: FilterQuery<IUserCountry>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(
        filter?: FilterQuery<IUserCountry> | undefined,
        select?: string | null | undefined,
        options?: QueryOptions<IUserCountry> | null | undefined,
    ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(
        id: string,
        select?: string,
    ): Promise<IUserCountry | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndDelete(id));
    }

    findByIdAndUpdate(
        id: string,
        update: UpdateQuery<IUserCountry>,
    ): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(
        filter: FilterQuery<IUserCountry>,
        update: UpdateQuery<IUserCountry>,
        options?: QueryOptions<IUserCountry> | null | undefined,
    ): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(
        id: string,
        select?: string | null | undefined,
    ): Promise<IUserCountry> {
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
        options?: QueryOptions<IUserCountry> | null | undefined,
    ) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(
        roomId: string,
        filter: FilterQuery<IUserCountry>,
    ): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }


    findOne(
        filter: FilterQuery<IUserCountry>,
        select?: string,
    ): Promise<IUserCountry | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    createMany(obj: Array<Partial<IUserCountry>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(
        filter: FilterQuery<IUserCountry>,
        update: UpdateQuery<IUserCountry>,
        session?,
        options?: QueryOptions<IUserCountry>,
    ): Promise<IUserCountry | null> {
        return Promise.resolve(
            this.model.findOneAndUpdate(filter, update, options).session(session),
        );
    }

    findCount(filter: FilterQuery<IUserCountry>, session?): Promise<any> {
        return Promise.resolve(this.model.estimatedDocumentCount(filter).session(session),);
    }
    aggregate(data )  {
        return Promise.resolve(this.model.aggregate(data));
    }

    async setUserCountry(uId: string, country: string) {
        let iCountry = await this.countryService.findOne({
            code: country.toUpperCase(),
        })
        if (!iCountry) return null;
        let uCountry = await this.findOne({
            uId,
            countryId: iCountry._id
        })
        if (!uCountry){
            await this.create({
                uId,
                countryId: iCountry._id
            })
        }
        return iCountry._id
    }


}
