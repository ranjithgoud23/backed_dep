/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable, NotFoundException} from "@nestjs/common";
import {IUserDevice} from "./entities/user_device.entity";
import {FilterQuery, Model, PipelineStage, QueryOptions, UpdateQuery} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {PushKeyAndProvider} from "../../../core/utils/interfaceces";
import {Platform, VPushProvider} from "../../../core/utils/enums";
import {BaseService} from "../../../core/common/base.service";
import {IUser} from "../user/entities/user.entity";

@Injectable()
export class UserDeviceService extends BaseService<IUserDevice> {
    constructor(
        @InjectModel("user_device")
        private readonly model: Model<IUserDevice>
    ) {
        super();

    }

    create(obj: Partial<IUserDevice>, session?): Promise<any> {
        return Promise.resolve(this.model.create([obj], {session}));
    }

    deleteMany(filter: FilterQuery<IUserDevice>): Promise<any> {
        return Promise.resolve(this.model.deleteMany(filter));
    }

    deleteOne(filter: FilterQuery<IUserDevice>): Promise<any> {
        return Promise.resolve(this.model.deleteOne(filter));
    }

    findAll(
        filter?: FilterQuery<IUserDevice> | undefined,
        select?: string | null | undefined,
        options?: QueryOptions<IUserDevice> | null | undefined
    ) {
        return Promise.resolve(this.model.find(filter, select, options));
    }

    findById(
        id: string,
        select?: string
    ): Promise<IUserDevice | null> {
        return Promise.resolve(this.model.findById(id, select));
    }

    findByIdAndDelete(id: string): Promise<any> {
        return Promise.resolve(this.model.findByIdAndDelete(id));
    }

    findByIdAndUpdate(
        id: string,
        update: UpdateQuery<IUserDevice>
    ): Promise<any> {
        return Promise.resolve(this.model.findByIdAndUpdate(id, update));
    }

    updateMany(
        filter: FilterQuery<IUserDevice>,
        update: UpdateQuery<IUserDevice>,
        options?: QueryOptions<IUserDevice> | null | undefined
    ): Promise<any> {
        return Promise.resolve(this.model.updateMany(filter, update, options));
    }

    async findByIdOrThrow(
        id: string,
        select?: string | null | undefined
    ): Promise<IUserDevice> {
        let m = await this.findById(id, select);
        if (!m)
            throw new NotFoundException(
                "user device with id " + id + " not found in db"
            );
        return m;
    }

    findOne(
        filter: FilterQuery<IUserDevice>,
        select?: string,
        options?: object
    ): Promise<IUserDevice | null> {
        return Promise.resolve(this.model.findOne(filter, select, options));
    }

    createMany(obj: Array<Partial<IUserDevice>>, session): Promise<any> {
        return Promise.resolve(this.model.create(obj, {session}));
    }

    findOneAndUpdate(
        filter: FilterQuery<IUserDevice>,
        update: UpdateQuery<IUserDevice>,
        session?,
        options?: QueryOptions<IUserDevice>
    ): Promise<IUserDevice | null> {
        return Promise.resolve(
            this.model.findOneAndUpdate(filter, update, options).session(session)
        );
    }

    async getUserPushTokens(peerId: string, platform?: Platform): Promise<PushKeyAndProvider> {
        let res = new PushKeyAndProvider([], [], []);
        let filter: object = {
            uId: peerId,
            pushKey: {$ne: null},
        }
        if (platform) {
            filter = {
                ...filter,
                platform: platform
            }
        }
        let devices = await this.findAll(filter, "pushKey pushProvider voipKey", {lean: true});
        for (let d of devices) {
            if (d.pushProvider == VPushProvider.fcm) {
                res.fcm.push(d.pushKey);
            }
            if (d.pushProvider == VPushProvider.onesignal) {
                res.oneSignal.push(d.pushKey);
            }
            if (d.voipKey) {
                res.voipKeys.push(d.voipKey);
            }
        }
        return res;
    }

    async getUsersPlatformAndPushKey(peerId: string) {
        return await this.findAll({
            uId: peerId,
            pushKey: {$ne: null}
        }, "pushKey platform", {lean: true});
    }

    async findCount(filter?: FilterQuery<IUserDevice>) {
        return this.model.countDocuments(filter);
    }

    async deleteFcmTokens(tokensToDelete: any[]) {
        await this.model.updateMany({
            pushKey: {$in: tokensToDelete}
        }, {
            pushKey: null
        });
    }

    async aggregate(pipeline?: PipelineStage[]) {
        return this.model.aggregate(pipeline)
    }

    async setLastSeenAt(_id: string) {
        await   this.model.findByIdAndUpdate(_id, {
            lastSeenAt: new Date()
        },);
    }
}
