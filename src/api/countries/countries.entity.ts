/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";


export interface ICountry {
    _id: string
    name: string,
    code: string,
    emoji: string,
    unicode: string,
    image: string
}


export const CountrySchema = new mongoose.Schema(
    {
        code: {type: String, required: true},
        emoji: {type: String, required: true},
        unicode: {type: String, required: true},
        name: {type: String, required: true},
        image: {type: String, required: true},

    },
    {
        timestamps: true,
        
    }
);






