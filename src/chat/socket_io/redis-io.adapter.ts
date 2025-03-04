/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {IoAdapter} from "@nestjs/platform-socket.io";
import {ServerOptions} from "socket.io";
import {INestApplicationContext} from "@nestjs/common";
import { AuthService } from "../../api/auth/auth.service";

export class RedisIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.use(async (socket, next) => {
            try {
                let authToken;
                if (socket.handshake['headers']['authorization']) {
                    authToken = socket.handshake['headers']['authorization'].split(" ")[1]
                } else {
                    if (socket.handshake.query['auth']) {
                        authToken = socket.handshake.query['auth'].split(" ")[1];
                    }
                }
                if (!authToken) {
                    next(new Error("Auth must be provided !"))
                }
                let authService = this.app.get(AuthService);
                socket.user = await authService.getVerifiedUser(authToken);
                next();
            } catch (e) {
                console.log(e);
                next(e);
            }
        });

        return server;
    }
}