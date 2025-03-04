/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "../../../core/common/dto/common.dto";
import {Allow, IsBoolean, IsBooleanString, IsEnum, IsISO8601, IsMongoId, ValidateIf} from "class-validator";

import {remove} from "remove-accents";
 import startOfDay from "date-fns/startOfDay";
import {endOfDay} from "date-fns";
import { MessageFilter, MessageType } from "../../../core/utils/enums";
import {newMongoObjId} from "../../../core/utils/utils";
export class MessagesSearchDto {
    @Allow()
    @ValidateIf(object => object['lastId'])
    @IsMongoId()
    lastId?: string

    @Allow()
    text?: string

    @Allow()
    limit?: number
    @Allow()
    @ValidateIf(object => object['from'])
    @IsISO8601()
    from?: string

    @Allow()
    @ValidateIf(object => object['to'])
    @IsISO8601()
    to?: string
    @Allow()
    @ValidateIf(object =>object['isAsc'] )
    @IsBooleanString()
    isAsc?: string

    @Allow()
    @ValidateIf(object => object['filter'])
    @IsEnum(MessageFilter)
    filter?: string

    getLimit() {
        if (this.limit) {
            if (this.limit <= 0 ||this.limit>30) {
                return 30
            }
            return  this.limit
        }
        return 30
    }

    getFilter() {
        let filter = {}
        if (this.text) {
            filter['c'] = {
                "$regex":+ ".*"+ this.text+ ".*",
                "$options": "i"
            };
        }
        if (this.from && this.to) {
            //start of day
            let sDate = startOfDay(new Date(this.from));
            let endDate = endOfDay(new Date(this.to));
            filter['createdAt'] = {
                $gte: sDate,
                $lte: endDate
            }
        }
        if (this.filter) {
            if (this.filter == MessageFilter.File) {
                filter['mT'] = MessageType.File
            }
            if (this.filter == MessageFilter.Voice) {
                filter['mT'] = MessageType.Voice
            }
            if (this.filter == MessageFilter.Links) {
                filter['linkAtt'] = {$ne: null};
            }
            if (this.filter == MessageFilter.Media) {
                filter['$or'] = [
                    {mT: MessageType.Image},
                    {mT: MessageType.Video},
                ]
            }
        }
        if (this.lastId) {
            filter['_id'] = {$lt: newMongoObjId(this.lastId)}
        }
        return filter
    }
}