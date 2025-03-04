/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import CommonDto from "../../core/common/dto/common.dto";

export class CreateS3UploaderDto extends CommonDto {

  mediaBuffer: Buffer;
  fileName: String;
}
