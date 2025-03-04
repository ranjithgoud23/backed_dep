/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
import {IStory} from "./entities/story.entity";
import {BaseService} from "../../../core/common/base.service";

@Injectable()
export class StoryService extends BaseService<IStory> {
    constructor(
        @InjectModel("story") private readonly model: Model<IStory>
    ) {
        super();
    }

    async create(dto: Partial<IStory>): Promise<IStory> {
        const created = await this.model.create(dto);
        // @ts-ignore
        return this.findById(created._id,);
    }

    deleteMany(filter: FilterQuery<IStory>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    deleteOne(filter: FilterQuery<IStory>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(
        filter?: FilterQuery<IStory> | undefined,
        select?: string | null | undefined,
        options?: QueryOptions<IStory> | null | undefined
    ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(
        id: string,
        select?: string
    ): Promise<IStory | null> {
        return Promise.resolve(this.model.findById(id, select,{
            lean: true
        }));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndDelete(id));
    }

    findByIdAndUpdate(
        id: string,
        update: UpdateQuery<IStory>
    ): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(
        filter: FilterQuery<IStory>,
        update: UpdateQuery<IStory>,
        options?: QueryOptions<IStory> | null | undefined
    ): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(
        id: string,
        select?: string | null | undefined
    ): Promise<IStory> {
        let m = await this.findById(id, select);
        if (!m)
            throw new NotFoundException(
                "story with id " + id + " not found in db"
            );
        return m;
    }

    findByRoomId(
        roomId: string,
        select?: string | null | undefined,
        options?: QueryOptions<IStory> | null | undefined
    ) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(
        roomId: string,
        filter: FilterQuery<IStory>
    ): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }


    findOne(
        filter: FilterQuery<IStory>,
        select?: string,
        options?: QueryOptions<IStory>
    ): Promise<IStory | null> {
        return Promise.resolve(this.model.findOne(filter, select, options));
    }

    createMany(obj: Array<Partial<IStory>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(
        filter: FilterQuery<IStory>,
        update: UpdateQuery<IStory>,
        session?,
        options?: QueryOptions<IStory>
    ): Promise<IStory | null> {
        return Promise.resolve(
            this.model.findOneAndUpdate(filter, update, options).session(session)
        );
    }

    findCount(filter: FilterQuery<IStory>, session?): Promise<any> {
        return Promise.resolve(this.model.estimatedDocumentCount(filter).session(session));
    }

    aggregate(stages: any[]): Promise<any> {
        return Promise.resolve(this.model.aggregate(stages));
    }

    // paginate(paginationParameters: any[]) {
    //     return Promise.resolve(this.model.paginate(...paginationParameters));
    // }


    async aggregateV2(stages: any[], page: number, limit: number) {
        let myAggregate = this.model.aggregate(stages);
        // @ts-ignore
        return this.model.aggregatePaginate(myAggregate, {
            page,
            limit,
        });
    }

    private async _deleteAll() {
      await  this.model.deleteMany({});
        console.log("Done")
    }
}
