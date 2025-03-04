/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
import {IMeetMember} from "./entities/call_member.entity";
import {BaseService} from "../../../core/common/base.service";

@Injectable()
export class CallMemberService extends BaseService<IMeetMember> {
    constructor(
        @InjectModel("meet_member") private readonly model: PaginateModel<IMeetMember>,
    ) {
        super()
    }

    create(obj: Partial<IMeetMember>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter?: FilterQuery<IMeetMember>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    findAll(filter?: FilterQuery<IMeetMember> | undefined, select?: string | null | undefined, options?: QueryOptions<IMeetMember> | null | undefined) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(id: string, select?: string | null | undefined): Promise<IMeetMember | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndRemove(id));
    }

    findByIdAndUpdate(id: string, update: Partial<IMeetMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(filter: FilterQuery<IMeetMember>, update: Partial<IMeetMember>, options?: QueryOptions<IMeetMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IMeetMember> {
        let m = await this.findById(id, select,)
        if (!m) throw new NotFoundException("group setting with id " + id + " not found in db")
        return m;
    }

    findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IMeetMember> | null | undefined) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(roomId: string,): Promise<any> {
        return Promise.resolve(this.model.findOneAndDelete({rId: roomId}));
    }

    findByRoomIdAndUpdate(roomId: string, update: Partial<IMeetMember>): Promise<any> {
        return Promise.resolve(this.updateMany({
            rId: roomId
        }, update));
    }

    findOne(filter: FilterQuery<IMeetMember>, select?: string | null | undefined): Promise<IMeetMember | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    createMany(obj: Array<Partial<IMeetMember>>, session?): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(filter: FilterQuery<IMeetMember>, update: Partial<IMeetMember>, session?, options?: QueryOptions<IMeetMember> | null | undefined): Promise<IMeetMember | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async findCount(filter?: FilterQuery<IMeetMember>,) {
        return this.model.countDocuments(filter)
    }


}
