/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
import {IGroupMember} from "./entities/group_member.entity";
import { BaseRoomService } from "../../core/common/base.room.service";


@Injectable()
export class GroupMemberService extends BaseRoomService<IGroupMember> {
    constructor(
        @InjectModel('group_member')
        private readonly model: PaginateModel<IGroupMember>,
    ) {
        super();
    }


    create(obj: Partial<IGroupMember>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IGroupMember>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    findAll(filter?: FilterQuery<IGroupMember> | undefined, select?: string | null | undefined, options?: QueryOptions<IGroupMember> | null | undefined) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(id: string, select?: string | null | undefined): Promise<IGroupMember | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndRemove(id));
    }

    findByIdAndUpdate(id: string, update: Partial<IGroupMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(filter: FilterQuery<IGroupMember>, update: Partial<IGroupMember>|any, options?: QueryOptions<IGroupMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IGroupMember> {
        let m = await this.findById(id, select)
        if (!m) throw new NotFoundException("group member with id " + id + " not found in db")
        return m;
    }

    findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IGroupMember> | null | undefined) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IGroupMember>): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }

    findByRoomIdAndUpdate(roomId: string, update: Partial<IGroupMember>): Promise<any> {
        return Promise.resolve(this.updateMany({
            rId: roomId
        }, update));
    }

    findOne(filter: FilterQuery<IGroupMember>, select?: string | null | undefined): Promise<IGroupMember | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    findByRoomIdAndUserIdAndUpdate(roomId: string, userId: string, update: Partial<IGroupMember>, session?, options?: QueryOptions<IGroupMember> | null | undefined) {
        return Promise.resolve(this.findOneAndUpdate({rId: roomId, uId: userId}, update, session, options));
    }

    createMany(obj: Array<Partial<IGroupMember>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(filter: FilterQuery<IGroupMember>, update: Partial<IGroupMember>, session?, options?: QueryOptions<IGroupMember> | null | undefined): Promise<IGroupMember | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async getMembersCount(rId: string) {
        return this.model.countDocuments({

            rId,
        });
    }

    async deleteOne(filter: FilterQuery<IGroupMember>): Promise<any> {
        return this.model.deleteOne(filter)
    }

    async findCount(filter: FilterQuery<IGroupMember>, options?: QueryOptions<IGroupMember>) {
        return this.model.countDocuments(filter, options).lean();
    }

    paginate(paginationParameters: any[]) {
        return Promise.resolve(this.model.paginate(...paginationParameters));
    }
}
