/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from '@nestjs/common';
import { FileUploaderService } from './file_uploader.service';

@Module({
  providers: [FileUploaderService],
  exports: [FileUploaderService],
})
export class FileUploaderModule {}
