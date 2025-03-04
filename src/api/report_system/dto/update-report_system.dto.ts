/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateReportSystemDto } from './create-report_system.dto';

export class UpdateReportSystemDto extends PartialType(CreateReportSystemDto) {}
