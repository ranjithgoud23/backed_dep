/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import mongoose from "mongoose";
import { Platform } from "../../core/utils/enums";


export interface IVersion {
  _id: string
  semVer: string,
  critical: boolean,
  notes: string,
  updateUrl?: string,
  notify: boolean
  platform: Platform
}


export const VersionSchema = new mongoose.Schema(
  {
    semVer: {type: String, required: true},
    critical: {type: Boolean, default: false},
    notes: {type: String, default: null},
    updateUrl: {type: String, default: null},
    notify: {type: Boolean, default: false},
    platform: {
      type: String,
      enum: Object.values(Platform),
      required: true
    },
  },
  {
    timestamps: true,

  }
);
VersionSchema.index({semVer: 1, platform: 1}, {unique: true})