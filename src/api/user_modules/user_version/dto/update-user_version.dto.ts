/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserVersionDto } from './create-user_version.dto';

export class UpdateUserVersionDto extends PartialType(CreateUserVersionDto) {}
