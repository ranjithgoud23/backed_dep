/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Injectable } from "@nestjs/common";
import path from "path";
import root from "app-root-path";
import fs from "fs";
import { S3UploaderTypes } from "../../core/utils/enums";
import { cropProfileImage } from "../../core/utils/sharp.utils";
import { fromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import { CreateS3UploaderDto } from "./create-s3_uploader.dto";

@Injectable()
export class FileUploaderService {


  async putImageCropped(imageBuffer: Buffer, myId: string) {
    let key = `${S3UploaderTypes.profileImage}-${uuidv4()}.jpg`;
    let image = await cropProfileImage(imageBuffer);
    await this._putFile(image, key, myId, true);
    return key;
  }

  async uploadChatMedia(dto: CreateS3UploaderDto) {
    let contentType = await fromBuffer(dto.mediaBuffer);
    let key = `${dto.myUser._id}/${S3UploaderTypes.media}-${uuidv4()}`;
    if (contentType) {
      key = `${key}.${contentType.ext}`
    } else {
      key = `${key}.${dto.fileName.split('.')[1]}`
    }
    await this._putFile(dto.mediaBuffer, key, dto.myUser._id);
    return key;
  }

  async _putFile(fileData: Buffer, key:string, userId: string, isPublic?: boolean) {
    let localPath = path.join(root.path, "public", isPublic ? "v-public" : "media", userId.toString());
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath);
    }
    return await new Promise((resolve, reject) => {
      let localPath = path.join(root.path, "public", isPublic ? "v-public" : "media", key);
      fs.writeFile(localPath, fileData,  err => {
        if (err) {
          reject(err);
          console.log(err);
        }
        resolve(key);
      });
    });
  }
}
