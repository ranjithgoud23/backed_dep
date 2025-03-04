/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, QueryOptions, UpdateQuery} from "mongoose";
 import {IOrderRoomSettings} from "./entities/order_room_setting.entity";
import { BaseRoomService } from "../../core/common/base.room.service";


@Injectable()
export class OrderRoomSettingsService extends BaseRoomService<IOrderRoomSettings> {


  constructor(
      @InjectModel('order_room_settings')
      private readonly model: Model<IOrderRoomSettings>,
  ) {
    super();
  }

  createMany(obj: Partial<IOrderRoomSettings>[], session?: any): Promise<any> {
    return Promise.resolve(this.model.create(obj, {session}));
  }

  create(obj: Partial<IOrderRoomSettings>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], {session}));
  }

  deleteMany(filter: FilterQuery<IOrderRoomSettings>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  findAll(filter?: FilterQuery<IOrderRoomSettings> | undefined, select?: string | null | undefined, options?: QueryOptions<IOrderRoomSettings> | null | undefined) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(id: string, select?: string | null | undefined): Promise<IOrderRoomSettings | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndRemove(id));
  }

  findByIdAndUpdate(id: string, update: Partial<IOrderRoomSettings> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }

  updateMany(filter: FilterQuery<IOrderRoomSettings>, update: Partial<IOrderRoomSettings>, options?: QueryOptions<IOrderRoomSettings> | null | undefined): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter, update, options));
  }

  async findByIdOrThrow(id: string, select?: string | null | undefined): Promise<IOrderRoomSettings> {
    let m = await this.findById(id, select)
    if (!m) throw new NotFoundException("single room settings with id " + id + " not found in db")
    return m;
  }

  findByRoomId(roomId: string, select?: string | null | undefined, options?: QueryOptions<IOrderRoomSettings> | null | undefined) {
    return Promise.resolve(this.findAll({rId: roomId}, select, options));
  }

  findByRoomIdAndDelete(roomId: string, filter: FilterQuery<IOrderRoomSettings>): Promise<any> {
    return Promise.resolve(this.deleteMany({rId: roomId}));
  }

  findByRoomIdAndUpdate(roomId: string, update: Partial<IOrderRoomSettings>): Promise<any> {
    return Promise.resolve(this.updateMany({
      rId: roomId
    }, update));
  }

  findOne(filter: FilterQuery<IOrderRoomSettings>, select?: string): Promise<IOrderRoomSettings | null> {
    return Promise.resolve(this.model.findOne(filter, select));
  }

  findOneAndUpdate(filter: FilterQuery<IOrderRoomSettings>, update: Partial<IOrderRoomSettings>, session?, options?: QueryOptions<IOrderRoomSettings> | null | undefined): Promise<IOrderRoomSettings | null> {
    return Promise.resolve(this.model.findOneAndUpdate(filter, update, options).session(session));
  }
  async findCount(filter?: FilterQuery<IOrderRoomSettings>,) {
    return this.model.countDocuments(filter)
  }
}
