/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, QueryOptions, UpdateQuery} from "mongoose";
import { BaseRoomService } from 'src/core/common/base.room.service';
import {IGroupSettings} from "./entities/group_setting.entity";


@Injectable()
export class GroupSettingsService extends BaseRoomService<IGroupSettings>{
  constructor(
      @InjectModel('group_settings')
      private readonly model: Model<IGroupSettings>,
  ) {
    super();
  }


  create(obj: Partial<IGroupSettings>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<IGroupSettings>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  findAll(filter?: FilterQuery<IGroupSettings> | undefined, select?: string | null | undefined, options?: QueryOptions<IGroupSettings> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<IGroupSettings | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: Partial<IGroupSettings> |any): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }
  updateMany(filter: FilterQuery<IGroupSettings>, update: Partial<IGroupSettings>, options?: QueryOptions<IGroupSettings> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter,update,options));
  }
  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IGroupSettings> {
    let m = await this.findById(id, select,)
    if (!m) throw new NotFoundException("group setting with id " + id + " not found in db")
    return m;
  }

  findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IGroupSettings> | null | undefined) {
    return Promise.resolve(this.findAll({rId: roomId}, select, options));
  }

  findByRoomIdAndDelete(roomId: string,  ): Promise<any> {
    return Promise.resolve(this.model.findOneAndDelete({rId: roomId}));
  }

  findByRoomIdAndUpdate(roomId: string, update: Partial<IGroupSettings>): Promise<any> {
    return Promise.resolve(this.updateMany({
      rId: roomId
    }, update));
  }

  findOne(filter: FilterQuery<IGroupSettings>, select: string | null | undefined): Promise<IGroupSettings | null> {
    return Promise.resolve(this.model.findOne(filter, select));
  }

  createMany(obj: Array<Partial<IGroupSettings>>, session): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  findOneAndUpdate(filter: FilterQuery<IGroupSettings>, update: Partial<IGroupSettings>, session?, options?: QueryOptions<IGroupSettings> | null | undefined): Promise<IGroupSettings | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }
  async findCount(filter?: FilterQuery<IGroupSettings>,) {
    return this.model.countDocuments(filter)
  }
}
