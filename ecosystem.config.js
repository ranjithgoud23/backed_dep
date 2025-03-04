/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

module.exports = {
    apps: [
        {
            name: "normal",
            script: 'dist/src/main.js',
            instances: 1,
            env_production: {
                NODE_ENV: "production"
            },
            watch: false,
            max_memory_restart: "8000M",
        }
    ],
};
