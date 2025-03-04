import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';

import {IStoryAttachment} from "./entities/story_attachment.entity";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, PaginateModel, PaginateOptions, QueryOptions, UpdateQuery} from "mongoose";
import {BaseService} from "../../../core/common/base.service";
import {isValidMongoId} from "../../../core/utils/utils";


@Injectable()
export class StoryAttachmentService extends BaseService<IStoryAttachment> {
    constructor(
        @InjectModel("story_attachment") private readonly model: PaginateModel<IStoryAttachment>,
    ) {
        super()
    }


    findById(id: string, select?: string | undefined): Promise<IStoryAttachment | null> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException("NOT VALID MONGO DB OBJECT " + id);
        }
        return Promise.resolve(this.model.findById(id, select).lean())
    }

    findByStoryId(id: string, select?: string | undefined): Promise<IStoryAttachment | null> {
        return Promise.resolve(this.model.findOne({storyId: id}, select).lean())
    }

    findByIdAndDelete(id: string) {
        if (!isValidMongoId(id)) {
            throw new BadRequestException("NOT VALID MONGO DB OBJECT " + id);
        }
        return Promise.resolve(this.model.findByIdAndRemove(id).lean())
    }

    async findByIdOrThrow(id: string, select?: string, options?: QueryOptions<IStoryAttachment>): Promise<IStoryAttachment> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException(" NOT VALID MONGO DB OBJECT " + id);
        }
        let q = await this.model.findById(id, select, options).lean()
        if (!q) throw new NotFoundException("IStoryAttachment text with id " + id + " Not exist in db")
        return q;
    }

    async findByIdAndUpdate(_id: string, update: UpdateQuery<IStoryAttachment>, session?: any) {
        return this.model.findByIdAndUpdate(_id, update, {session});
    }

    async create(dto: Partial<IStoryAttachment>) {
        let cat = await this.model.create(dto)
        return this.findById(cat.id)
    }

    deleteMany(filter: FilterQuery<IStoryAttachment>): Promise<any> {
        return Promise.resolve(undefined);
    }

    updateMany(filter: FilterQuery<IStoryAttachment>, update: UpdateQuery<IStoryAttachment>, options?: QueryOptions<IStoryAttachment> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    findAll(filter?: FilterQuery<IStoryAttachment>, select?: string, options?: QueryOptions<IStoryAttachment> | null | undefined): Promise<any> {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findOne(filter: FilterQuery<IStoryAttachment>, select?: string, options?: {}): Promise<IStoryAttachment | null> {
        return Promise.resolve(this.model.findOne(filter, select, options));
    }

    findOneAndUpdate(filter: FilterQuery<IStoryAttachment>, update: UpdateQuery<IStoryAttachment>, session?, options?: QueryOptions<IStoryAttachment> | null | undefined): Promise<IStoryAttachment | null> {
        return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
    }


    async findCount(filter?: FilterQuery<IStoryAttachment>,) {
        return this.model.countDocuments(filter)
    }

    createMany(obj: Array<Partial<IStoryAttachment>>, session): Promise<any> {
        return Promise.resolve(undefined);
    }


    async paginateModel(p: any[], options?: PaginateOptions) {
        return this.model.paginate(...p)
    }

}
