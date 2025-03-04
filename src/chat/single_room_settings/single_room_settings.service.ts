/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, QueryOptions, UpdateQuery} from "mongoose";
 import {ISingleRoomSettings} from "./entities/single_room_setting.entity";
import { BaseRoomService } from "../../core/common/base.room.service";


@Injectable()
export class SingleRoomSettingsService extends BaseRoomService<ISingleRoomSettings> {


  constructor(
      @InjectModel('single_room_settings')
      private readonly model: Model<ISingleRoomSettings>,
  ) {
    super();
  }

  createMany(obj: Partial<ISingleRoomSettings>[], session?: any): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  create(obj: Partial<ISingleRoomSettings>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<ISingleRoomSettings>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  findAll(filter?: FilterQuery<ISingleRoomSettings> | undefined, select?: string | null | undefined, options?: QueryOptions<ISingleRoomSettings> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<ISingleRoomSettings | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: Partial<ISingleRoomSettings> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }

  updateMany(filter: FilterQuery<ISingleRoomSettings>, update: Partial<ISingleRoomSettings>, options?: QueryOptions<ISingleRoomSettings> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter, update, options));
  }

  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<ISingleRoomSettings> {
    let m = await this.findById(id, select)
    if (!m) throw new NotFoundException("single room settings with id " + id + " not found in db")
    return m;
  }

  findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<ISingleRoomSettings> | null | undefined) {
    return Promise.resolve(this.findAll({rId: roomId}, select, options));
  }

  findByRoomIdAndDelete(roomId: string, filter: FilterQuery<ISingleRoomSettings>): Promise<any> {
    return Promise.resolve(this.deleteMany({rId: roomId}));
  }

  findByRoomIdAndUpdate(roomId: string, update: Partial<ISingleRoomSettings>): Promise<any> {
    return Promise.resolve(this.updateMany({
      rId: roomId
    }, update));
  }

  findOne(filter: FilterQuery<ISingleRoomSettings>, select?: string): Promise<ISingleRoomSettings | null> {
    return Promise.resolve(this.model.findOne(filter, select));
  }

  findOneAndUpdate(filter: FilterQuery<ISingleRoomSettings>, update: Partial<ISingleRoomSettings>, session?, options?: QueryOptions<ISingleRoomSettings> | null | undefined): Promise<ISingleRoomSettings | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }
  async findCount(filter?: FilterQuery<ISingleRoomSettings>,) {
    return this.model.countDocuments(filter)
  }
}
