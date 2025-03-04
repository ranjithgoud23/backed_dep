/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, QueryOptions, UpdateQuery} from "mongoose";
import {IBroadcastSetting} from "./entities/broadcast_setting.entity";
import { BaseRoomService } from "../../core/common/base.room.service";


@Injectable()
export class BroadcastSettingsService extends BaseRoomService<IBroadcastSetting>{
  constructor(
      @InjectModel('broadcast_settings')
      private readonly model: Model<IBroadcastSetting>,
  ) {
    super();
  }


  create(obj: Partial<IBroadcastSetting>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<IBroadcastSetting>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  findAll(filter?: FilterQuery<IBroadcastSetting> | undefined, select?: string | null | undefined, options?: QueryOptions<IBroadcastSetting> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<IBroadcastSetting | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: Partial<IBroadcastSetting> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }
  updateMany(filter: FilterQuery<IBroadcastSetting>, update: Partial<IBroadcastSetting>, options?: QueryOptions<IBroadcastSetting> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter,update,options));
  }
  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IBroadcastSetting> {
    let m = await this.findById(id, select)
    if (!m) throw new NotFoundException("broadcast setting with id " + id + " not found in db")
    return m;
  }

  findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IBroadcastSetting> | null | undefined) {
    return Promise.resolve(this.findAll({rId: roomId}, select, options));
  }

  findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IBroadcastSetting>): Promise<any> {
    return Promise.resolve(this.deleteMany({rId: roomId}));
  }

  findByRoomIdAndUpdate(roomId: string, update: Partial<IBroadcastSetting>): Promise<any> {
    return Promise.resolve(this.updateMany({
      rId: roomId
    }, update));
  }

  findOne(filter: FilterQuery<IBroadcastSetting>, select: string | null | undefined): Promise<IBroadcastSetting | null> {
    return Promise.resolve(this.model.findOne(filter, select));
  }

  createMany(obj: Array<Partial<IBroadcastSetting>>, session): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  findOneAndUpdate(filter: FilterQuery<IBroadcastSetting>, update: Partial<IBroadcastSetting>, session?, options?: QueryOptions<IBroadcastSetting> | null | undefined): Promise<IBroadcastSetting | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }
  async findCount(filter?: FilterQuery<IBroadcastSetting>,) {
    return this.model.countDocuments(filter)
  }
}
