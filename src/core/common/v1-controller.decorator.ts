/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Controller} from '@nestjs/common';

export function V1Controller(prefix: string): ClassDecorator {
    if (prefix.startsWith("/")) {
        return Controller(`api/v1${prefix}`);
    }
    return Controller(`api/v1/${prefix}`);

}