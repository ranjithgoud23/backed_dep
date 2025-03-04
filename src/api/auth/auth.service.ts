/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, ForbiddenException, HttpException, Injectable} from "@nestjs/common";
import LoginDto from "./dto/login.dto";
import RegisterDto from "./dto/register.dto";
import date from "date-and-time";
import bcrypt from "bcrypt";
import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user_modules/user/user.service";
import geoIp from "geoip-lite";
import {remove} from "remove-accents";
import {UserDeviceService} from "../user_modules/user_device/user_device.service";
import {IUser} from "../user_modules/user/entities/user.entity";
import {AppConfigService} from "../app_config/app_config.service";
import {isUUID} from "class-validator";
import {ConfigService} from "@nestjs/config";
import {UserCountryService} from "../user_modules/user_country/user_country.service";
import {AccessTokenType, MailType, Platform, PushTopics, RegisterStatus, VPushProvider} from "../../core/utils/enums";
import {
    resOK,
    i18nApi
} from "../../core/utils/res.helpers";
import ResetPasswordDto from "./dto/reset.password.dto";
import LogoutDto from "./dto/logout.dto";
import {newMongoObjId} from "../../core/utils/utils";
import {JwtDecodeRes} from "../../core/utils/interfaceces";
import {FileUploaderService} from "../../common/file_uploader/file_uploader.service";
import {NotificationEmitterService} from "../../common/notification_emitter/notification_emitter.service";
import {MailEmitterService} from "../mail/mail.emitter.service";


@Injectable()
export class AuthService {

    constructor(
        private readonly uploaderService: FileUploaderService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly appConfigService: AppConfigService,
        private readonly configService: ConfigService,
        private readonly userDevice: UserDeviceService,
        private readonly mailEmitterService: MailEmitterService,
        private readonly userCountryService: UserCountryService,
        private readonly notificationEmitterService: NotificationEmitterService
    ) {
    }

    async comparePassword(dtoPassword, dbHasPassword) {
        let bcryptRes = await bcrypt.compare(dtoPassword, dbHasPassword);
        if (!bcryptRes) {
            throw new BadRequestException(i18nApi.invalidLoginDataString);
        }
        return true
    }

    async login(dto: LoginDto, isDev: boolean) {

        let foundedUser: IUser = await this.userService.findOneByEmailOrThrow(
            dto.email,
            "+password userDevice lastMail banTo email registerStatus deletedAt"
        );
        await this.comparePassword(dto.password, foundedUser.password)
        if (foundedUser.banTo) {
            throw new BadRequestException(i18nApi.yourAccountBlockedString);
        }
        // if (foundedUser.deletedAt) {
        //     await this.userService.findByIdAndUpdate(foundedUser._id, {
        //         deletedAt: null
        //     })
        // }

        let countryData = await geoIp.lookup(dto.ip);
        let countryId;
        if (countryData) {
            countryId = await this.userCountryService.setUserCountry(foundedUser._id, countryData.country);
        }
        await this.userService.findByIdAndUpdate(foundedUser._id, {
            address: countryData,
            countryId: countryId
        });

        let oldDevice = await this.userDevice.findOne({
            uId: foundedUser._id,
            userDeviceId: dto.deviceId
        });
        if (oldDevice) {
            await this.userDevice.findByIdAndUpdate(oldDevice._id, {
                pushProvider: this._getVPushProvider(dto.pushKey),
                pushKey: dto.pushKey
            });
            let access = this._signJwt(foundedUser._id.toString(), oldDevice._id.toString());
            return resOK({
                "accessToken": access,
                "status": foundedUser.registerStatus
            });
        }
        // this is new device
        let mongoDeviceId = newMongoObjId().toString();
        let access = this._signJwt(foundedUser._id.toString(), mongoDeviceId);
        await this.userDevice.create({
            _id: mongoDeviceId,
            userDeviceId: dto.deviceId,
            uId: foundedUser._id,
            language: dto.language,
            platform: dto.platform,
            pushProvider: this._getVPushProvider(dto.pushKey),
            dIp: dto.ip,
            deviceInfo: dto.deviceInfo,
            pushKey: dto.pushKey
        });
        await this._pushNotificationSubscribe(dto.pushKey, dto.platform);
        return resOK({
            "accessToken": access,
            "status": foundedUser.registerStatus
        });
    }


    async register(dto: RegisterDto) {
        let countryData = await geoIp.lookup(dto.ip);
        let foundedUser: IUser = await this.userService.findOneByEmail(
            dto.email,
            "email"
        );
        if (foundedUser) {
            throw new BadRequestException(i18nApi.userAlreadyRegisterString);
        }
        const uniqueCode = await this.generateUniqueCode();
        let appConfig = await this.appConfigService.getConfig();

        let createdUser: IUser = await this.userService.create({
            email: dto.email,
            fullName: dto.fullName,
            registerStatus: appConfig.userRegisterStatus,
            bio: null,
            uniqueCode: uniqueCode,
            fullNameEn: remove(dto.fullName),
            registerMethod: dto.method,
            address: countryData,
            password: dto.password,
            lastSeenAt: new Date(),
            // @ts-ignore
            lastMail: {},
            userImage: appConfig.userIcon
        });
        if (countryData) {
            let countryId = await this.userCountryService.setUserCountry(createdUser._id, countryData.country);
            await this.userService.findByIdAndUpdate(createdUser._id, {
                countryId
            });
        }
        let accessToken = await this.deleteDevicesAndCreateNew({
            userId: createdUser._id,
            session: null,
            language: dto.language,
            platform: dto.platform,
            ip: dto.ip,
            deviceInfo: dto.deviceInfo,
            pushKey: dto.pushKey,
            userDeviceId: dto.deviceId
        });
        if (dto.imageBuffer) {
            let res = await this.uploaderService.putImageCropped(dto.imageBuffer, createdUser._id);
            await this.userService.findByIdAndUpdate(createdUser._id, {
                userImage: res
            });
        }
        let config = await this.appConfigService.getConfig();
        await this._pushNotificationSubscribe(dto.pushKey, dto.platform);
        return {
            accessToken: accessToken,
            "status": config.userRegisterStatus
        };
    }

    async sendOtpResetPassword(email: string, isDev: boolean) {
        let usr = await this.userService.findOneByEmailOrThrow(email.toLowerCase(), "email fullName userImages verifiedAt lastMail");
        let code = await this.mailEmitterService.sendConfirmEmail(usr, MailType.ResetPassword, isDev)
        await this.userService.findByIdAndUpdate(usr._id, {
            lastMail: {
                type: MailType.ResetPassword,
                sendAt: new Date(),
                code: code,
                expired: false
            }
        });
        if (isDev) {
            return "Password reset code has been send to your email " + code;
        }
        return "Password reset code has been send to your email";
    }

    async verifyOtpResetPassword(dto: ResetPasswordDto) {
        let user = await this.userService.findOneByEmailOrThrow(dto.email, "lastMail");
        if (!user.lastMail || !user.lastMail.code) {
            throw new BadRequestException(i18nApi.noCodeHasBeenSendToYouToVerifyYourEmailString);
        }
        let appConfig = await this.appConfigService.getConfig();
        let min = parseInt(date.subtract(new Date(), user.lastMail.sendAt).toMinutes().toString(), 10);
        if (user.lastMail.expired || min > appConfig.maxExpireEmailTime) {
            throw new BadRequestException(i18nApi.codeHasBeenExpiredString);
        }
        if (user.lastMail.type != MailType.ResetPassword) {
            throw new BadRequestException("Cant process with the mail type");
        }
        if (user.lastMail.code == dto.code) {
            await this.userService.findByIdAndUpdate(user._id, {
                "lastMail.expired": true,
                "password": dto.newPassword
            });
            return "Password has been reset successfully";
        } else {
            throw new BadRequestException(i18nApi.invalidCodeString);
        }
    }

    async getVerifiedUser(accessToken: string) {
        let jwtDecodeRes = this._jwtVerify(accessToken);
        let user: IUser = await this.userService.findById(
            jwtDecodeRes.userId,
            "fullName fullNameEn verifiedAt userImage userType banTo deletedAt registerStatus"
        );
        if (!user) throw new ForbiddenException(i18nApi.whileAuthCanFindYouString);
        user._id = user._id.toString();
        this.userLoginValidate(user);
        let device = await this.userDevice.findById(jwtDecodeRes.deviceId, "_id platform");
        if (!device) throw new HttpException(i18nApi.userDeviceSessionEndDeviceDeletedString, 450);
        user.currentDevice = device;
        return user;
    }


    async logOut(dto: LogoutDto) {
        if (dto.logoutFromAll == true) {
            let foundedUser: IUser = await this.userService.findById(
                dto.myUser._id,
                "+password userDevice verifiedAt lastMail banTo email registerStatus"
            );
            let bcryptRes = await bcrypt.compare(dto.password, foundedUser.password);
            if (!bcryptRes) {
                throw new BadRequestException(i18nApi.invalidLoginDataString);
            }
            await this.userDevice.deleteMany({
                uId: dto.myUser._id
            });
            return i18nApi.deviceHasBeenLogoutFromAllDevicesString;
        }

        await this.userDevice.findByIdAndDelete(dto.myUser.currentDevice._id);
        return "Device has been logout";
    }

    private async sendMailToUser(user: IUser, mailType: MailType, isDev: boolean, session?) {

    }

    async generateUniqueCode(): Promise<number> {
        let uniqueCode: number;
        let isUnique = false;

        while (!isUnique) {
            uniqueCode = Math.floor(100000 + Math.random() * 900000);

            let existingUser: IUser = await this.userService.findOne({
                uniqueCode: uniqueCode
            }, "uniqueCode");

            if (!existingUser) {
                isUnique = true;
            }
        }

        return uniqueCode;
    }

    private userLoginValidate(user: IUser) {
        // if (!user.verifiedAt) throw new BadRequestException('User not verified yet please verify first')
        if (user.banTo) throw new HttpException(i18nApi.yourAccountBlockedString, 450);
        if (user.deletedAt) throw new HttpException(i18nApi.yourAccountDeletedString, 450);
        // if (user.registerStatus != RegisterStatus.accepted) throw new HttpException(i18nApi.userRegisterStatusNotAcceptedYetString, 450);
    }

    private _signJwt(userId: string, deviceId: string) {
        return this.jwtService.sign({
            id: userId.toString(), deviceId: deviceId.toString(), accessType: AccessTokenType.Access
        });
    }

    private async deleteDevicesAndCreateNew(dto: {
        userId: string,
        session?,
        pushKey?: string,
        userDeviceId: string,
        ip: string,
        deviceInfo: {},
        language: string,
        platform: Platform,
    }) {
        await this.userDevice.deleteMany({
            uId: dto.userId
        });
        let mongoDeviceId = newMongoObjId().toString();
        let access = this._signJwt(dto.userId, mongoDeviceId);
        await this.userDevice.create({
            _id: mongoDeviceId,
            uId: dto.userId,
            dIp: dto.ip,
            pushProvider: this._getVPushProvider(dto.pushKey),
            pushKey: dto.pushKey,
            userDeviceId: dto.userDeviceId,
            lastSeenAt: new Date(),
            deviceInfo: dto.deviceInfo,
            language: dto.language,
            platform: dto.platform
        }, dto.session);
        return access;
    }

    private _jwtVerify(token: string): JwtDecodeRes {
        try {
            let payload = this.jwtService.verify(token);
            return {
                deviceId: payload["deviceId"],
                userId: payload["id"]
            };
        } catch (err) {
            throw new BadRequestException("Jwt access token not valid " + token);
        }
    }

    private _getVPushProvider(pushKey?: string) {
        if (!pushKey) return null;
        let isOneSignal = isUUID(pushKey.toString());
        return isOneSignal ? VPushProvider.onesignal : VPushProvider.fcm;
    }

    private async _pushNotificationSubscribe(pushKey: string, platform: Platform) {

        if (!pushKey) {
            return;
        }
        if (this._getVPushProvider(pushKey) == VPushProvider.fcm) {
            if (platform == Platform.Android) {
                await this.notificationEmitterService.subscribeFcmTopic(pushKey, PushTopics.AdminAndroid);
            }
            if (platform == Platform.Ios) {
                await this.notificationEmitterService.subscribeFcmTopic(pushKey, PushTopics.AdminIos);
            }
        } else {
            if (platform == Platform.Android) {
                await this.notificationEmitterService.subscribeOnesignalTopic(pushKey, PushTopics.AdminAndroid);
            }
            if (platform == Platform.Ios) {
                await this.notificationEmitterService.subscribeOnesignalTopic(pushKey, PushTopics.AdminIos);
            }
        }
    }

    ///this the register
    // async sendRegisterOtp(
    //     dto: RegisterDto,
    //     isDev: boolean,
    //     session?: mongoose.ClientSession,
    // ) {
    //   let countryData = await geoIp.lookup(dto.ip)
    //   let res = {};
    //   res['message'] = 'Verification code has been send to your email';
    //   let foundedUser: IUser = await this.userService.findOneByEmail(
    //       dto.email,
    //       'email lastMail verifiedAt',
    //   );
    //   // already register and verified
    //   if (foundedUser && foundedUser.verifiedAt) {
    //     throw new BadRequestException('User already in data base and verified');
    //   }
    //   // already register but not verified yet
    //   if (foundedUser && !foundedUser.verifiedAt) {
    //     let code = await this.sendMailToUser(foundedUser, MailType.VerifyEmail, isDev, session);
    //     if (isDev) {
    //       res['code'] = code
    //     }
    //     res['accessToken'] = await this.deleteDevicesAndCreateNew({
    //       userId: foundedUser._id,
    //       session: session,
    //       lang: dto.lang,
    //       platform: dto.platform,
    //       ip: dto.ip,
    //       mapInfo: JSON.parse(dto.mapInfo),
    //       pushKey: dto.pushKey,
    //       userDeviceId: dto.deviceId
    //     })
    //     return res;
    //   }
    //
    //   //not registered yet
    //   let createdUser: IUser = await this.userService.create({
    //     email: dto.email,
    //     fullName: dto.fullName,
    //     fullNameEn: remove(dto.fullName),
    //     address: countryData,
    //     lastSeenAt: new Date(),
    //     password: dto.password,
    //     // @ts-ignore
    //     lastMail: {},
    //     userImage:defaultUserBigImage,
    //   }, session);
    //   let code = await this.sendMailToUser(createdUser, MailType.VerifyEmail, isDev, session);
    //   if (isDev) {
    //     res['code'] = code
    //   }
    //   res['accessToken'] = await this.deleteDevicesAndCreateNew({
    //     userId: createdUser._id,
    //     session: session,
    //     lang: dto.lang,
    //     platform: dto.platform,
    //     ip: dto.ip,
    //     mapInfo: JSON.parse(dto.mapInfo),
    //     pushKey: dto.pushKey,
    //     userDeviceId: dto.deviceId
    //   })
    //   if (dto.imageBuffer) {
    //     let res = await this.s3.putImageCropped(dto.imageBuffer, createdUser._id);
    //     await this.userService.findByIdAndUpdate(createdUser._id, {
    //       userImage: res,
    //     }, session);
    //   }
    //   return res;
    // }


    // async validateEmail(dto: ValidateEmailDto) {
    //   let foundedUser: IUser = await this.userService.findOneByEmailOrThrow(dto.email, "fullName email lastMail verifiedAt")
    //   if (foundedUser.verifiedAt) {
    //     throw new BadRequestException('User already verified');
    //   }
    //   if (!foundedUser.lastMail || !foundedUser.lastMail.code) {
    //     throw new BadRequestException(
    //         'No code has been send to you to verify your email',
    //     );
    //   }
    //   let min = parseInt(
    //       date
    //           .subtract(new Date(), foundedUser.lastMail.sendAt)
    //           .toMinutes()
    //           .toString(),
    //       10,
    //   );
    //   if (foundedUser.lastMail.expired || min > appConfig.maxExpireEmailTime) {
    //     throw new BadRequestException('Code has been expired');
    //   }
    //   if (foundedUser.lastMail.type != MailType.VerifyEmail) {
    //     throw new BadRequestException('You must use code from VerifyEmail Type');
    //   }
    //   if (foundedUser.lastMail.code == dto.code) {
    //     await this.userService.findByIdAndUpdate(foundedUser._id, {
    //       verifiedAt: new Date(),
    //       'lastMail.expired': true,
    //     });
    //     return "Email has been verified successfully"
    //   }
    //   throw new BadRequestException('Invalid code !');
    // }
}
