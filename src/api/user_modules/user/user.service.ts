/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {FilterQuery, PaginateModel, PaginateOptions, QueryOptions, UpdateQuery} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {PaginationParameters} from "mongoose-paginate-v2";
import {IUser} from "./entities/user.entity";
import {UserDeviceService} from "../user_device/user_device.service";
import {isValidMongoId} from "../../../core/utils/utils";
import {BaseService} from "../../../core/common/base.service";
import {remove} from "remove-accents";
import {i18nApi} from "../../../core/utils/res.helpers";
import {RegisterStatus} from "../../../core/utils/enums";

@Injectable()
export class UserService extends BaseService<IUser> {
    constructor(
        @InjectModel("user") private readonly model: PaginateModel<IUser>,
        private readonly userDevice: UserDeviceService
    ) {
        super();

    }

    createMany(obj: Partial<IUser>[], session?: any): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    aggregate(obj: any[], session?: any): Promise<any> {
        return Promise.resolve(this.model.aggregate(obj, {session}));
    }

    async findOneByEmail(email: string, select?: string) {
        return this.model.findOne({email: email}).select(select).lean();
    }

    async findOneByEmailOrThrow(email: string, select: string) {
        let usr = await this.model.findOne({email: email}).select(select).lean();
        if (!usr)
            throw new NotFoundException(i18nApi.userEmailNotFound);
        return usr;
    }


    async setLastSeenAt(_id: string) {
        await this.model.findByIdAndUpdate(_id, {
            lastSeenAt: new Date()
        });
    }


    async findByIds(usersIds: string[], select?: string) {
        return this.model.find({_id: {$in: usersIds}}, select).lean();
    }


    findById(id: string, select?: string, options?: {}): Promise<IUser | null> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException("NOT VALID MONGO DB OBJECT " + id);
        }
        return Promise.resolve(this.model.findById(id, select, options).lean());
    }

    findByIdAndDelete(id: string) {
        if (!isValidMongoId(id)) {
            throw new BadRequestException("NOT VALID MONGO DB OBJECT " + id);
        }
        return Promise.resolve(this.model.findByIdAndRemove(id).lean());
    }

    async findByIdOrThrow(id: string, select?: string, options?: {}): Promise<IUser> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException(" NOT VALID MONGO DB OBJECT " + id);
        }
        let user = await this.model.findById(id, select,).lean();
        if (!user) throw new NotFoundException("User with id " + id + " Not exist in db");
        return user;
    }

    async findByIdAndUpdate(_id: string, update: {}, session?) {
        return this.model.findByIdAndUpdate(_id, update, {session});
    }

    async create(obj: Partial<IUser>, session?) {
        let cs = await this.model.create([obj], {session});
        return cs[0];
    }


    async searchV2(dto: Object, notContains: any[]) {
        let filter: object = {
            _id: {
                $nin: notContains
            },
            deletedAt: {
                $eq: null
            },
            registerStatus: {
                $eq: RegisterStatus.accepted
            },
            "userPrivacy.publicSearch": {
                $eq: true
            }
        };
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 30,
                    sort: "-_id",
                    ...filter,
                    ...dto
                }
            }
        ).get();
        if (paginationParameters[1].page <= 0) {
            paginationParameters[1].page = 1;
        }
        if (paginationParameters[1].limit <= 0 || paginationParameters[1].limit >= 50) {
            paginationParameters[1].limit = 30;
        }
        paginationParameters[1].select = "fullName fullNameEn userImage bio createdAt isPrime roles hasBadge";
        let fullName = dto["fullName"];
        if (fullName) {
            filter = {
                ...filter,
                fullNameEn: {
                    "$regex": ".*" + remove(fullName) + ".*",
                    "$options": "i"
                }
            };
        }
        paginationParameters[0] = filter;
        return this.model.paginate(...paginationParameters);
    }

    deleteMany(filter: FilterQuery<IUser>): Promise<any> {
        return Promise.resolve(undefined);
    }

    updateMany(filter: FilterQuery<IUser>, update: UpdateQuery<IUser>, options?: QueryOptions<IUser> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    findAll(filter?: FilterQuery<IUser>, select?: string, options?: QueryOptions<IUser> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findOne(filter: FilterQuery<IUser>, select: string): Promise<IUser | null> {

        return Promise.resolve(this.model.findOne(filter, select));
    }

    findOneAndUpdate(filter: FilterQuery<IUser>, update: UpdateQuery<IUser>, session?, options?: QueryOptions<IUser> | null | undefined): Promise<IUser | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async paginateModel(filter: FilterQuery<IUser>, options?: PaginateOptions) {
        return this.model.paginate(filter, options);
    }

    async fullPaginateModel(p) {
        return this.model.paginate(...p);
    }

    async findCount(filter?: FilterQuery<IUser>) {
        return this.model.countDocuments(filter);
    }

    private async _addIsPrime() {
        await this.model.updateMany({}, {
            isPrime: false,
            hasBadge: false,
            roles: []
        })
    }
}
