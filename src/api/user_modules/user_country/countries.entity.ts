/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose, {Schema} from "mongoose";


export interface IUserCountry {
    _id: string
    uId: string,
    countryId: string,
}


export const UserCountrySchema = new mongoose.Schema(
    {
        uId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
        countryId: {type: Schema.Types.ObjectId, required: true, ref: "countries"},
    },
    {
        timestamps: true,
        
    }
);
UserCountrySchema.index({uId: 1, countryId: 1}, {unique: true});





