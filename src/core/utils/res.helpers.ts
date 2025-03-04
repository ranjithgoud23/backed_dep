/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

export enum ApiCode {
    SUCCESS = 2000,
    FAILED = 4000,
    VERIFY_EMAIL_SEND = 2100,
    CLINT_NEED_UPDATE = 5500,
}


export const resOK = (data: any, code = ApiCode.SUCCESS, msg?: null) => ({
    code,
    data,
    msg,
});

export const resErr = (data: string) => ({
    success: false,
    code: ApiCode.FAILED,
    data,
});

export const i18nApi = {
    invalidLoginDataString: "invalidLoginData",
    userEmailNotFound: "userEmailNotFound",
    yourAccountBlockedString: "yourAccountBlocked",
    yourAccountDeletedString: "yourAccountDeleted",
    userAlreadyRegisterString: "userAlreadyRegister",
    codeHasBeenExpiredString: "codeHasBeenExpired",
    invalidCodeString: "invalidCode",
    whileAuthCanFindYouString: "whileAuthCanFindYou",
    userRegisterStatusNotAcceptedYetString: "userRegisterStatusNotAcceptedYet",
    deviceHasBeenLogoutFromAllDevicesString: "deviceHasBeenLogoutFromAllDevices",
    userDeviceSessionEndDeviceDeletedString: "userDeviceSessionEndDeviceDeleted",
    noCodeHasBeenSendToYouToVerifyYourEmailString: "noCodeHasBeenSendToYouToVerifyYourEmail",
    roomAlreadyInCallString: "roomAlreadyInCall",
    peerUserInCallNowString: "peerUserInCallNow",
    callNotAllowedString: "callNotAllowed",
    peerUserDeviceOfflineString: "peerUserDeviceOffline",
    emailMustBeValid: "emailMustBeValid",
    wait2MinutesToSendMail: "wait2MinutesToSendMail",
}
