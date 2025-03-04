/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, PaginateModel, QueryOptions} from "mongoose";
import {IReport} from "./entities/report_system.entity";
import {BaseService} from "../../core/common/base.service";

@Injectable()
export class ReportSystemService extends BaseService<IReport> {
    constructor(
        @InjectModel('reports')
        private readonly model: PaginateModel<IReport>,
    ) {
        super();
    }


    create(obj: Partial<IReport>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IReport>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    findAll(filter?: FilterQuery<IReport> | undefined, select?: string | null | undefined, options?: QueryOptions<IReport> | null | undefined) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(id: string, select?: string | null | undefined): Promise<IReport | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndRemove(id));
    }

    findByIdAndUpdate(id: string, update: Partial<IReport> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(filter: FilterQuery<IReport>, update: Partial<IReport> | any, options?: QueryOptions<IReport> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IReport> {
        let m = await this.findById(id, select)
        if (!m) throw new NotFoundException("report member with id " + id + " not found in db")
        return m;
    }

    findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IReport> | null | undefined) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IReport>): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }

    findByRoomIdAndUpdate(roomId: string, update: Partial<IReport>): Promise<any> {
        return Promise.resolve(this.updateMany({
            rId: roomId
        }, update));
    }

    findOne(filter: FilterQuery<IReport>, select?: string | null | undefined): Promise<IReport | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    findByRoomIdAndUserIdAndUpdate(roomId: string, userId: string, update: Partial<IReport>, session?, options?: QueryOptions<IReport> | null | undefined) {
        return Promise.resolve(this.findOneAndUpdate({rId: roomId, uId: userId}, update, session, options));
    }

    createMany(obj: Array<Partial<IReport>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(filter: FilterQuery<IReport>, update: Partial<IReport>, session?, options?: QueryOptions<IReport> | null | undefined): Promise<IReport | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async getMembersCount(rId: string) {
        return this.model.countDocuments({

            rId,
        });
    }

    async deleteOne(filter: FilterQuery<IReport>): Promise<any> {
        return this.model.deleteOne(filter)
    }

    async findCount(filter: FilterQuery<IReport>, options?: QueryOptions<IReport>) {
        return this.model.countDocuments(filter, options).lean();
    }

    paginate(paginationParameters: any[]) {
        return Promise.resolve(this.model.paginate(...paginationParameters));
    }
}
