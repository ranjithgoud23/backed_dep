/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
import { Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import { BaseService } from "../../core/common/base.service";
import { IBan } from "./entities/ban.entity";
@Injectable()
export class  BanService extends BaseService<IBan> {
  constructor(
    @InjectModel('ban') private readonly model: PaginateModel<IBan>,
  ) {
    super();
  }

  createMany(obj: Partial<IBan>[], session?: any): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  create(obj: Partial<IBan>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<IBan>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  deleteOne(filter: FilterQuery<IBan>): Promise<any> {
    return Promise.resolve(this.model.deleteOne(filter));
  }

  findAll(filter?: FilterQuery<IBan> | undefined, select?: string | null | undefined, options?: QueryOptions<IBan> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<IBan | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: UpdateQuery<IBan> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }

  updateMany(filter: FilterQuery<IBan>, update: UpdateQuery<IBan>, options?: QueryOptions<IBan> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter, update, options));
  }

  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IBan> {
    let m = await this.findById(id, select)
    if (!m) throw new NotFoundException("single room settings with id " + id + " not found in db")
    return m;
  }


  findOne(filter: FilterQuery<IBan>, select?: string): Promise<IBan | null> {
    return Promise.resolve(this.model.findOne(filter, select));
  }

  findOneAndUpdate(filter: FilterQuery<IBan>, update: UpdateQuery<IBan>, session?, options?: QueryOptions<IBan> | null | undefined): Promise<IBan | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }

  async getBan(myId: string, peerId: string) {
    return this.model.findOne({
      $or: [
        {$and: [{targetId: myId}, {bannerId: peerId}]},
        {$and: [{bannerId: myId}, {targetId: peerId}]}
      ]
    })
  }

  findCount(filter: FilterQuery<IBan>, session): any {
    return this.model.countDocuments(filter)
  }
  paginate(paginationParameters: any[]) {
    return Promise.resolve(this.model.paginate(...paginationParameters));
  }
}
