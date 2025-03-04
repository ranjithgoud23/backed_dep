/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { ReportSystemService } from './report_system.service';
import { V1Controller } from "../../core/common/v1-controller.decorator";

@V1Controller('report')
export class ReportSystemController {
  constructor(private readonly reportSystemService: ReportSystemService) {}

}
