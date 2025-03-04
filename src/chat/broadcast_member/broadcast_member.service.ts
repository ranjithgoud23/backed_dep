/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, PaginateModel, ProjectionType, QueryOptions, UpdateQuery} from "mongoose";
 import {IBroadcastMember} from "./entities/broadcast_member.entity";
import { BaseRoomService } from "../../core/common/base.room.service";


@Injectable()
export class BroadcastMemberService extends BaseRoomService<IBroadcastMember> {


    constructor(
        @InjectModel('broadcast_member') private readonly model: PaginateModel<IBroadcastMember>,
    ) {
        super();
    }

    create(obj: Partial<IBroadcastMember>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IBroadcastMember>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    findAll(filter: FilterQuery<IBroadcastMember>, select?: string , options?: QueryOptions<IBroadcastMember> ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(id: string, select?: string | null | undefined): Promise<IBroadcastMember | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndRemove(id));
    }

    findByIdAndUpdate(id: string, update: Partial<IBroadcastMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(filter: FilterQuery<IBroadcastMember>, update: Partial<IBroadcastMember>|any, options?: QueryOptions<IBroadcastMember> | null | undefined): Promise<any> {

        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IBroadcastMember> {
        let m = await this.findById(id, select)
        if (!m) throw new NotFoundException("broadcast with id " + id + " not found in db")
        return m;
    }

    findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IBroadcastMember> | null | undefined) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IBroadcastMember>): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }

    findByRoomIdAndUpdate(roomId: string, update: Partial<IBroadcastMember>): Promise<any> {
        return Promise.resolve(this.updateMany({
            rId: roomId
        }, update));
    }

    findOne(filter: FilterQuery<IBroadcastMember>, select?: string | null | undefined): Promise<IBroadcastMember | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    createMany(obj: Array<Partial<IBroadcastMember>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(filter: FilterQuery<IBroadcastMember>, update: Partial<IBroadcastMember>, session?, options?: QueryOptions<IBroadcastMember> | null | undefined): Promise<IBroadcastMember | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async getBroadcastMembersCount(bId: string) {
        return this.model.countDocuments({
            bId,
        });
    }

    async deleteOne(filter: FilterQuery<IBroadcastMember>): Promise<any> {
        return this.model.deleteOne(filter)
    }

    findCount(filter: FilterQuery<IBroadcastMember>, session?: any): Promise<any> {
        return Promise.resolve(this.model.countDocuments(filter));
    }

    paginate(paginationParameters: any[]) {
        return Promise.resolve(this.model.paginate(...paginationParameters));
    }
}
