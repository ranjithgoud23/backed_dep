import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
 import {IChatRequest} from "./entities/chat.request.entity";
import {BaseService} from "../../core/common/base.service";

@Injectable()
export class ChatRequestService extends BaseService<IChatRequest>{
    constructor(
        @InjectModel("chat_request") private readonly model: PaginateModel<IChatRequest>
    ) {
        super();
    }


    create(obj: Partial<IChatRequest>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IChatRequest>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    deleteOne(filter: FilterQuery<IChatRequest>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(
        filter?: FilterQuery<IChatRequest> | undefined,
        select?: string | null | undefined,
        options?: QueryOptions<IChatRequest> | null | undefined
    ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(
        id: string,
        select?: string
    ): Promise<IChatRequest | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndDelete(id));
    }

    findByIdAndUpdate(
        id: string,
        update: UpdateQuery<IChatRequest>
    ): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(
        filter: FilterQuery<IChatRequest>,
        update: UpdateQuery<IChatRequest>,
        options?: QueryOptions<IChatRequest> | null | undefined
    ): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(
        id: string,
        select?: string | null | undefined
    ): Promise<IChatRequest> {
        let m = await this.findById(id, select);
        if (!m)
            throw new NotFoundException(
                "chatRequest with id " + id + " not found in db"
            );
        return m;
    }

    findByRoomId(
        roomId: string,
        select?: string | null | undefined,
        options?: QueryOptions<IChatRequest> | null | undefined
    ) {
        return Promise.resolve(this.findAll({rId: roomId}, select, options));
    }

    findByRoomIdAndDelete(
        roomId: string,
        filter: FilterQuery<IChatRequest>
    ): Promise<any> {
        return Promise.resolve(this.deleteMany({rId: roomId}));
    }


    findOne(
        filter: FilterQuery<IChatRequest>,
        select?: string,
        options?: QueryOptions<IChatRequest>
    ): Promise<IChatRequest | null> {
        return Promise.resolve(this.model.findOne(filter, select, options));
    }

    createMany(obj: Array<Partial<IChatRequest>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(
        filter: FilterQuery<IChatRequest>,
        update: UpdateQuery<IChatRequest>,
        session?,
        options?: QueryOptions<IChatRequest>
    ): Promise<IChatRequest | null> {
        return Promise.resolve(
            this.model.findOneAndUpdate(filter, update, options).session(session)
        );
    }

    findCount(filter: FilterQuery<IChatRequest>, session?): Promise<any> {
        return Promise.resolve(this.model.estimatedDocumentCount(filter).session(session));
    }

    aggregate(stages: any[]): Promise<any> {
        return Promise.resolve(this.model.aggregate(stages));
    }

    paginate(paginationParameters: any[]) {
        return Promise.resolve(this.model.paginate(...paginationParameters));
    }

    async aggregateV2(stages: any[], page: number, limit: number) {
        let myAggregate = this.model.aggregate(stages);
        // @ts-ignore
        return this.model.aggregatePaginate(myAggregate, {
            page,
            limit,
        });
    }
}
