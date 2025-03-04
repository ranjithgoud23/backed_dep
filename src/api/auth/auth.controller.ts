/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import RegisterDto from "./dto/register.dto";
import LoginDto from "./dto/login.dto";
import { IpAddress } from "../../core/custom.decorator/request.ip";
import { IsDevelopment } from "../../core/custom.decorator/decorators";
import { jsonDecoder } from "../../core/utils/app.validator";
import { imageFileInterceptor } from "../../core/utils/upload_interceptors";
import { resOK } from "../../core/utils/res.helpers";
import LogoutDto from "./dto/logout.dto";
import { VerifiedAuthGuard } from "../../core/guards/verified.auth.guard";
import ResetPasswordDto from "./dto/reset.password.dto";
import { V1Controller } from "../../core/common/v1-controller.decorator";

@V1Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post("/login")
    @HttpCode(200)
    async login(
        @Body() dto: LoginDto,
        @IpAddress() ipAddress:any,
        @IsDevelopment() isDev: boolean
    ) {
        dto.ip = ipAddress;
        try {
            dto.deviceInfo = jsonDecoder(dto.deviceInfo)
        } catch (err) {
            //
        }
        return this.authService.login(dto, isDev);
    }

    @Post("/register")
    @UseInterceptors(imageFileInterceptor)
    async registerUser(
        @Req() req:any,
        @Body() dto: RegisterDto,
        @IpAddress() ipAddress:any,
        @UploadedFile() file?: any
    ) {
        if (file) {
            dto.imageBuffer = file.buffer;
        }
        try {
            dto.deviceInfo = jsonDecoder(dto.deviceInfo)
        } catch (err) {
            //
        }
        dto.ip = ipAddress;
        return resOK(await this.authService.register(dto,),);
    }

    // @Post("/send-otp-register")
    // @UseInterceptors(imageFileInterceptor)
    // async sendRegisterOtp(
    //     @Req() req:any,
    //     @Body() dto: RegisterDto,
    //     @IpAddress() ipAddress,
    //     @IsDevelopment() isDevelopment: boolean,
    //     @UploadedFile() file?: any
    // ) {
    //     if (file) {
    //         dto.imageBuffer = file.buffer;
    //     }
    //     dto.ip = ipAddress;
    //     return resOK(await this.authService.sendRegisterOtp(dto, isDevelopment, null),);
    // }

    // @Post("/validate-email")
    // @HttpCode(200)
    // async validateEmail(@Body() dto: ValidateEmailDto) {
    //     return resOK(await this.authService.validateEmail(dto));
    // }


    @Post("/send-otp-reset-password")
    async sendOtpResetPassword(@Body("email") email: string, @IsDevelopment() isDv: boolean) {
        if (!email) {
            throw new BadRequestException("Email is required");
        }
        return resOK(await this.authService.sendOtpResetPassword(email, isDv));
    }

    @UseGuards(VerifiedAuthGuard)
    @Post("/logout")
    async logOut(@Body() dto: LogoutDto, @Req() req:any) {
        dto.myUser = req.user
        return resOK(await this.authService.logOut(dto,));
    }

    @Post("/verify-and-reset-password")
    async verifyOtpResetPassword(@Body() dto: ResetPasswordDto) {
        return resOK(await this.authService.verifyOtpResetPassword(dto));
    }

}
