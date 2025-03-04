/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter
} from "@nestjs/common";
 import {Socket} from "socket.io";
import {SocketEventsType} from "../utils/enums";
import { WsBadRequestException, WsUnknownException } from "./ws-exceptions";

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const socket: Socket = host.switchToWs().getClient();
            console.log(exception);
        if (exception instanceof BadRequestException) {
            const exceptionData = exception.getResponse();
            const exceptionMessage =
                exceptionData["message"] ?? exceptionData ?? exception.name;

            const wsException = new WsBadRequestException(exceptionMessage);
            socket.emit(SocketEventsType.v1OnException, wsException.getError().toString());
            return;
        }

        const wsException = new WsUnknownException(exception.toString());
        socket.emit(SocketEventsType.v1OnException, wsException.getError().toString());
    }
}