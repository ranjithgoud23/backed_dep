/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {UserCountryService} from "../../user_modules/user_country/user_country.service";
import {newMongoObjId} from "../../../core/utils/utils";

@Injectable()
export class UserCountryAdminService {
    constructor(readonly userCountryService: UserCountryService) {
    }


    async getUserCountries(id: string) {
        let agg = [
            {
                '$match': {
                    'uId': newMongoObjId(id)
                }
            }, {
                '$group': {
                    '_id': '$countryId',
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$lookup': {
                    'from': 'countries',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'data'
                }
            },
            {
                $sort: {
                    'count': -1,
                },
            },
        ]
        return this.userCountryService.aggregate(agg)
    }

    async getCountriesInfo() {

        let agg = [
            {
                '$group': {
                    '_id': '$countryId',
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$lookup': {
                    'from': 'countries',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'data'
                }
            },
            {
                $sort: {
                    'count': -1,
                },
            },
        ]
        /*
         {
             "_id": "63e983a5462f1f057f7b3760",
             "count": 2,
             "data": [
             {
                 "_id": "63e983a5462f1f057f7b3760",
                 "code": "SA",
                 "emoji": "🇸🇦",
                 "unicode": "U+1F1F8 U+1F1E6",
                 "name": "Saudi Arabia",
                 "image": "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/SA.svg",
                 "createdAt": "2023-02-13T00:26:14.142Z",
                 "updatedAt": "2023-02-13T00:26:14.142Z"
             }
            ]
         }
      */
        let data = await this.userCountryService.aggregate(agg)
        let res = [];
        for (let i of data) {
            try {
                res.push({
                    count: i["count"],
                    country: i["data"][0]
                });
            } catch (err) {
                console.log("Error while get userCountryService getCountriesInfo for loop!");
            }
        }
        return res;

    }

}
