import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseService } from '../../../core/common/base.service';
import {isValidMongoId} from "../../../core/utils/utils";
import {ICallHistory} from "./call.history.entity";

@Injectable()
export class CallHistoryService extends BaseService<ICallHistory> {
    constructor(
        @InjectModel('call_history') private readonly model: PaginateModel<ICallHistory>
    ) {
        super();
    }

    findById(id: string, select?: string): Promise<ICallHistory | null> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException('NOT VALID MONGO DB OBJECT ' + id);
        }
        return this.model.findById(id, select).lean().exec();
    }

    findByIdAndDelete(id: string): Promise<ICallHistory | null> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException('NOT VALID MONGO DB OBJECT ' + id);
        }
        return this.model.findByIdAndDelete(id).lean().exec();
    }

    async findByIdOrThrow(id: string, select?: string, options?: QueryOptions): Promise<ICallHistory> {
        if (!isValidMongoId(id)) {
            throw new BadRequestException('NOT VALID MONGO DB OBJECT ' + id);
        }
        const record = await this.model.findById(id, select, options).lean().exec();
        if (!record) {
            throw new NotFoundException('CallHistory with id ' + id + ' does not exist in the database.');
        }
        return record;
    }

    async findByIdAndUpdate(
        _id: string,
        update: UpdateQuery<ICallHistory>,
        session?: any
    ): Promise<ICallHistory | null> {
        return this.model.findByIdAndUpdate(_id, update, { session, new: true }).lean().exec();
    }

    async create(dto: Partial<ICallHistory>): Promise<ICallHistory> {
        const created = await this.model.create(dto);
        return this.findById(created._id);
    }

    deleteMany(filter: FilterQuery<ICallHistory>): Promise<any> {
        return this.model.deleteMany(filter).exec();
    }

    delete(filter: FilterQuery<ICallHistory>): Promise<any> {
        return this.model.deleteOne(filter).exec();
    }

    updateMany(
        filter: FilterQuery<ICallHistory>,
        update: UpdateQuery<ICallHistory>,
        options?: QueryOptions
    ): Promise<any> {
        return this.model.updateMany(filter, update, options).exec();
    }

    findAll(
        filter?: FilterQuery<ICallHistory>,
        select?: string,
        options?: QueryOptions
    ): Promise<ICallHistory[]> {
        return this.model.find(filter, select, options).lean().exec();
    }

    findOne(
        filter: FilterQuery<ICallHistory>,
        select?: string,
        options?: QueryOptions
    ): Promise<ICallHistory | null> {
        return this.model.findOne(filter, select, options).lean().exec();
    }

    findOneAndUpdate(
        filter: FilterQuery<ICallHistory>,
        update: UpdateQuery<ICallHistory>,
        session?: any,
        options?: QueryOptions
    ): Promise<ICallHistory | null> {
        return this.model
            .findOneAndUpdate(filter, update, { ...options, session, new: true })
            .lean()
            .exec();
    }

    async findCount(filter?: FilterQuery<ICallHistory>): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    async createMany(records: Array<Partial<ICallHistory>>, session?: any): Promise<ICallHistory[]> {
        const createdRecords = await this.model.insertMany(records, { session });
        return createdRecords.map(record => record.toObject());
    }

    async paginateModel(filter: any, options?: any): Promise<any> {
        if (this.model.paginate) {
            return this.model.paginate(filter, options);
        } else {
            throw new Error('Paginate is not implemented for this model');
        }
    }
}
