/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import sharp from "sharp";


export async function cropProfileImageToImages(buffer: Buffer) {
  const promises = [];
  promises.push(
    sharp(buffer)
      .resize({ width: 200, height: 200 })
      .jpeg({ quality: 100 })
      .toBuffer()
  );
  promises.push(
    sharp(buffer)
      .resize({ width: 50, height: 50 })
      .jpeg({ quality: 80 })
      .toBuffer()
  );
  return await Promise.all(promises);
}

export async function cropProfileImage(buffer: Buffer) {
  return sharp(buffer)
    .resize({ width: 1024, height: 1024 })
    .jpeg({ quality: 90 })
    .toBuffer();
}
