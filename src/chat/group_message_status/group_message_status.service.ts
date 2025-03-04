/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, PaginateModel, QueryOptions, UpdateQuery} from "mongoose";
 import {IGroupMessageStatus} from "./entities/group_message_status.entity";

@Injectable()
export class GroupMessageStatusService {
  constructor(
      @InjectModel('group_message_status') private readonly model: PaginateModel<IGroupMessageStatus>,
  ) {
  }

  create(obj: Partial<IGroupMessageStatus>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<IGroupMessageStatus>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  findAll(filter?: FilterQuery<IGroupMessageStatus> | undefined, select?: string | null | undefined, options?: QueryOptions<IGroupMessageStatus> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<IGroupMessageStatus | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: Partial<IGroupMessageStatus> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }

  updateMany(filter: FilterQuery<IGroupMessageStatus>, update: Partial<IGroupMessageStatus>, options?: QueryOptions<IGroupMessageStatus> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter, update, options));
  }

  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IGroupMessageStatus> {
    let m = await this.findById(id, select)
    if (!m) throw new NotFoundException("Message group status  with id " + id + " not found in db")
    return m;
  }

  findByRoomIdAndUpdate(roomId: string, update: Partial<IGroupMessageStatus>): Promise<any> {
    return Promise.resolve(this.updateMany({
      rId: roomId
    }, update));
  }

  findOne(filter: FilterQuery<IGroupMessageStatus>, select?: string | null | undefined, options?: QueryOptions<IGroupMessageStatus>): Promise<IGroupMessageStatus | null> {
    return Promise.resolve(this.model.findOne(filter, select, options));
  }

  createMany(obj: Array<Partial<IGroupMessageStatus>>, session?): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  findOneAndUpdate(filter: FilterQuery<IGroupMessageStatus>, update: Partial<IGroupMessageStatus>, session?, options?: QueryOptions<IGroupMessageStatus> | null | undefined): Promise<IGroupMessageStatus | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }
  async findCount(filter: FilterQuery<IGroupMessageStatus>, options?: QueryOptions<IGroupMessageStatus>) {
    return this.model.countDocuments(filter, options).lean();
  }

  async paginate(params:any[]) {
    return this.model.paginate(...params) ;
  }
}
