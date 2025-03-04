/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger} from "@nestjs/common";
import {Request, Response} from "express";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message;

        try {
            if (exception instanceof HttpException) {
                let isArray = Array.isArray(exception.getResponse()["message"]);
                if (isArray) {
                    /// class validator execution
                    message = exception.getResponse()["message"][0];
                } else {
                    ///  Normal http exception it 350 exception
                    try {
                        let msgX = exception.getResponse()["message"]
                        if (!msgX) {
                            message = exception.getResponse()
                        } else {
                            message = msgX;
                        }

                    } catch (e) {
                        message = exception.getResponse();
                    }
                }
            } else {
                // unknown exception !
                message = exception.toString();
                // @ts-ignore
                this.logger.error(exception.stack);
            }
        } catch (e) {
            message = exception.toString()
        }
        let errorBody = message.toString()

        const responseBody = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            data: errorBody,
            requestInfo: {
                path: request.path,
                //   baseUrl: request.baseUrl,
                hostname: request.hostname,
                method: request.method,
                originalUrl: request.originalUrl,
                query: request.query,
                body: request.body,
                params: request.params,
                // filesLength: request.files?.length,
                headers: request.headers,
            },
        };
        return response.status(status).json(responseBody);
    }
}