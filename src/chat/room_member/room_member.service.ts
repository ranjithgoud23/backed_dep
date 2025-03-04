/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import mongoose, {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from 'mongoose';
import {BaseRoomService} from 'src/core/common/base.room.service';
import {IRoomMember} from "./entities/room_member.entity";


@Injectable()
export class RoomMemberService extends BaseRoomService<IRoomMember> {

    constructor(
        @InjectModel('room_member') private readonly model: Model<IRoomMember>,
    ) {
        super();

    }


    create(obj: Partial<IRoomMember>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IRoomMember>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    findOneAndDelete(filter: FilterQuery<IRoomMember>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(filter?: FilterQuery<IRoomMember>, select?: string, options?: QueryOptions<IRoomMember>, distinct?: boolean) {
        if (distinct) {
            return Promise.resolve(this.model.find(filter, select, options).distinct("rId"));
        }
        return Promise.resolve(this.model.find(filter, select, options))
    }

    findById(id: string, select?: string | null | undefined): Promise<IRoomMember | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndRemove(id));
    }

    findByIdAndUpdate(id: string, update: Partial<IRoomMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(filter: FilterQuery<IRoomMember>, update: Partial<IRoomMember>, options?: QueryOptions<IRoomMember> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IRoomMember> {
        let m = await this.findById(id, select)
        if (!m) throw new NotFoundException("Room member with id " + id + " not found in db")
        return m;
    }

    findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IRoomMember> | null | undefined) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndUserIdAndUpdate(roomId: string, userId: string, update: Partial<IRoomMember>, session?, options?: QueryOptions<IRoomMember> | null | undefined) {
        return Promise.resolve(this.findOneAndUpdate({rId: roomId, uId: userId}, update, session, options));
    }

    findByRoomIdAndUserId(roomId: string, userId: string, select?: string, session?, options?: QueryOptions<IRoomMember> | null | undefined) {
        return Promise.resolve(this.findOne({rId: roomId, uId: userId}, select,));
    }

    findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IRoomMember>): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }

    findByRoomIdAndUpdate(roomId: string, update: Partial<IRoomMember>): Promise<any> {
        return Promise.resolve(this.updateMany({
            rId: roomId
        }, update));
    }

    findOne(filter: FilterQuery<IRoomMember>, select?: string): Promise<IRoomMember | null> {
        return Promise.resolve(this.model.findOne(filter, select));
    }

    createMany(obj: Array<Partial<IRoomMember>>, session?): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    aggregate(agg: any[], options?: mongoose.AggregateOptions): Promise<any> {
        return Promise.resolve(this.model.aggregate(agg, options).exec());
    }

    findOneAndUpdate(filter: FilterQuery<IRoomMember>, update: Partial<IRoomMember> , session?, options?: QueryOptions<IRoomMember> | null | undefined): Promise<IRoomMember | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }

    async findCount(filter?: FilterQuery<IRoomMember>,) {
        return this.model.countDocuments(filter)
    }

    async aggregateV2(stages: any, page, limit) {
        let myAggregate = this.model.aggregate(stages);
        // @ts-ignore
        return this.model.aggregatePaginate(myAggregate, {
            page,
            limit,
        });
    }
}
