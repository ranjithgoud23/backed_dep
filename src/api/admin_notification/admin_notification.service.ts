/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Injectable, NotFoundException } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, PaginateModel, QueryOptions, UpdateQuery } from "mongoose";
import { IAdminNotification } from "./entities/admin_notification.entity";
import { BaseService } from "../../core/common/base.service";


@Injectable()
export class AdminNotificationService extends BaseService<IAdminNotification> {
  constructor(
    @InjectModel("admin_notification") private readonly model: PaginateModel<IAdminNotification>
  ) {
    super();
  }


  create(obj: Partial<IAdminNotification>, session?): Promise<any> {
    return Promise.resolve(this.model.create([obj], { session }));
  }

  deleteMany(filter: FilterQuery<IAdminNotification>): Promise<any> {
    return Promise.resolve(this.model.deleteMany(filter));
  }

  deleteOne(filter: FilterQuery<IAdminNotification>): Promise<any> {
    return Promise.resolve(this.model.deleteOne(filter));
  }

  findAll(
    filter?: FilterQuery<IAdminNotification> | undefined,
    select?: string | null | undefined,
    options?: QueryOptions<IAdminNotification> | null | undefined
  ) {
    return Promise.resolve(this.model.find(filter, select, options));
  }

  findById(
    id: string,
    select?: string
  ): Promise<IAdminNotification | null> {
    return Promise.resolve(this.model.findById(id, select));
  }

  findByIdAndDelete(id: string): Promise<any> {
    return Promise.resolve(this.model.findByIdAndDelete(id));
  }

  findByIdAndUpdate(
    id: string,
    update: UpdateQuery<IAdminNotification>
  ): Promise<any> {
    return Promise.resolve(this.model.findByIdAndUpdate(id, update));
  }

  updateMany(
    filter: FilterQuery<IAdminNotification>,
    update: UpdateQuery<IAdminNotification>,
    options?: QueryOptions<IAdminNotification> | null | undefined
  ): Promise<any> {
    return Promise.resolve(this.model.updateMany(filter, update, options));
  }

  async findByIdOrThrow(
    id: string,
    select?: string | null | undefined
  ): Promise<IAdminNotification> {
    let m = await this.findById(id, select);
    if (!m)
      throw new NotFoundException(
        "country with id " + id + " not found in db"
      );
    return m;
  }

  findByRoomId(
    roomId: string,
    select?: string | null | undefined,
    options?: QueryOptions<IAdminNotification> | null | undefined
  ) {
    return Promise.resolve(this.findAll({ rId: roomId }, select, options));
  }

  findByRoomIdAndDelete(
    roomId: string,
    filter: FilterQuery<IAdminNotification>
  ): Promise<any> {
    return Promise.resolve(this.deleteMany({ rId: roomId }));
  }


  findOne(
    filter: FilterQuery<IAdminNotification>,
    select?: string,
    options?: QueryOptions<IAdminNotification>
  ): Promise<IAdminNotification | null> {
    return Promise.resolve(this.model.findOne(filter, select, options));
  }

  createMany(obj: Array<Partial<IAdminNotification>>, session): Promise<any> {
    return Promise.resolve(this.model.create(obj, { session }));
  }

  findOneAndUpdate(
    filter: FilterQuery<IAdminNotification>,
    update: UpdateQuery<IAdminNotification>,
    session?,
    options?: QueryOptions<IAdminNotification>
  ): Promise<IAdminNotification | null> {
    return Promise.resolve(
      this.model.findOneAndUpdate(filter, update, options).session(session)
    );
  }

  findCount(filter: FilterQuery<IAdminNotification>, session?): Promise<any> {
    return Promise.resolve(this.model.estimatedDocumentCount(filter).session(session));
  }

  aggregate(stages: any[]): Promise<any> {
    return Promise.resolve(this.model.aggregate(stages));
  }
  paginate(paginationParameters: any[]) {
    return Promise.resolve(this.model.paginate(...paginationParameters));
  }

}
