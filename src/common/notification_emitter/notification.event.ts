/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import * as OneSignal from "onesignal-node";
import {ConfigService} from "@nestjs/config";
import {CreateNotificationBody} from "onesignal-node/lib/types";
import {getMessaging, Messaging} from "firebase-admin/messaging";
import {UserService} from "../../api/user_modules/user/user.service";
import {UserDeviceService} from "../../api/user_modules/user_device/user_device.service";
import {CallStatus, PushTopics} from "../../core/utils/enums";
import path from "path";
import root from "app-root-path";
import apn from "@parse/node-apn";
import {v4 as uuidv4} from "uuid";
import {PushCallDataModel} from "../../chat/call_modules/utils/push-call-data.model";

//
export class NotificationData {
    tokens: string[];
    title: string;
    body: string;
    tag: string;
    isSilent?: boolean;
    data: {};
    sound?: string

    constructor(args: { tokens: string[], title: string, body: string, tag: string, data: {}, isSilent?: boolean }) {
        this.tokens = args.tokens;
        this.title = args.title;
        this.body = args.body;
        this.isSilent = args.isSilent;
        this.tag = args.tag;
        this.data = args.data;
    }

}

const fcmErrorCodes = [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument"
];


@Injectable()
export class NotificationEvent {
    readonly messaging?: Messaging;
    readonly onesignalClient?: OneSignal.Client;

    isFirebaseFcmEnabled: boolean;
    isOneSignalEnabled: boolean;

    constructor(
        private readonly userService: UserService,
        private readonly userDevice: UserDeviceService,
        private readonly config: ConfigService
    ) {
        this.isFirebaseFcmEnabled = config.getOrThrow("isFirebaseFcmEnabled") == "true";
        this.isOneSignalEnabled = config.getOrThrow("isOneSignalEnabled") == "true";

        if (this.isFirebaseFcmEnabled) {
            this.messaging = getMessaging();
        }
        if (this.isOneSignalEnabled) {
            this.onesignalClient = new OneSignal.Client(
                this.config.getOrThrow("oneSignalAppId"),
                this.config.getOrThrow("oneSignalApiKey")
            );
        }

    }


    @OnEvent("topic.onesignal")
    async onesignalTopic(event: object) {
        let token = event["token"];
        let topic = event["topic"];
        if (!this.onesignalClient) {
            return;
        }
        await this.onesignalClient.editDevice(token, {"tags": {[topic]: true}});
    }

    @OnEvent("topic.fcm")
    async fcmTopic(event: any) {
        let token = event["token"];
        let topic = event["topic"];
        if (this.messaging) {
            await this.messaging.subscribeToTopic(token, topic);
        }
    }

    @OnEvent("un.sub")
    async unsubscribeFCM(event: any) {
        let token = event["token"];
        let topic = event["topic"];
        if (this.messaging) {
            await this.messaging.unsubscribeFromTopic(token, topic);
        }
    }


    @OnEvent("send.all.active")
    async sendToAllActiveUsers(title: string, body: string) {
        if (this.isFirebaseFcmEnabled) {
            try {
                await this.messaging.sendToTopic(PushTopics.AdminAndroid, {
                    notification: {
                        body,
                        title
                    }
                }, {
                    contentAvailable: true,
                    priority: "high",

                });
                await this.messaging.sendToTopic(PushTopics.AdminIos, {
                    notification: {
                        body,
                        title
                    }
                }, {
                    contentAvailable: true,
                    priority: "high",
                });
            } catch (err) {
                console.log(err);
            }
        }
        if (this.isOneSignalEnabled) {
            const notification: CreateNotificationBody = {
                "included_segments": [
                    "Active Users",
                    "Subscribed Users"
                ],
                "priority": 10,
                headings: {"en": title},
                "contents": {
                    "en": body
                }
            };
            this.onesignalClient.createNotification(notification)
                .then(response => {
                    //console.log(response)
                })
                .catch(e => {
                    console.log(e);
                });
        }
    }

    @OnEvent("send.onesignal")
    async sendToOneSignal(event: NotificationData) {
        if (event.tokens.length == 0) {
            return;
        }
        if (event.body.length > 1000) {
            event.body = event.body.slice(0, 1000);
        }
        if (event.data.toString().length >= 4000) {
            delete event.data["vMessage"];
        }
        try {
            for (let i = 0; i < event.tokens.length; i += 2000) {
                const listOf1000Tokens = event.tokens.slice(i, i + 2000);
                // using await to wait for sending to 1000 token
                await this._oneSignalPush(event, listOf1000Tokens);
            }
        } catch (e) {
            console.log(e);
        }

    }

    @OnEvent("send.fcm")
    async sendToFcm(event: NotificationData) {
        if (event.tokens.length == 0) {
            return;
        }
        if (event.body.length > 1000) {
            event.body = event.body.slice(0, 1000);
        }
        if (event.data.toString().length >= 4000) {
            delete event.data["vMessage"];
        }
        try {
            if (this.isFirebaseFcmEnabled) {
                for (let i = 0; i < event.tokens.length; i += 1000) {
                    const listOf1000Tokens = event.tokens.slice(i, i + 1000);
                    // using await to wait for sending to 1000 token
                    if (event.isSilent) {
                        await this._fcmSendSilent(event, listOf1000Tokens);
                    } else {
                        await this._fcmSend(event, listOf1000Tokens);
                    }

                }
            }
        } catch (e) {
            console.log(e);
        }
    }


    private async _fcmSend(event: NotificationData, tokens: any[]) {
        this.messaging
            .sendEachForMulticast({
                notification: {
                    body: event.body,
                    title: event.title
                },
                tokens: tokens,
                data: event.data,
                android: {
                    notification: {
                        tag: Math.random().toString(),
                        icon: "@mipmap/ic_launcher",
                        priority: "max",
                        defaultSound: true,
                        channelId: event.tag
                    },
                    priority: "high"
                    // collapseKey: event.tag,
                },
                apns: {
                    payload: {
                        aps: {
                            contentAvailable: true,
                        },
                    },
                    headers: {
                        "apns-priority": "10"
                    }
                }
            })
            .then(async (reason) => {
                await this._afterFcmSendMsg(reason, event);
            })
            .catch((reason) => {
                console.log(reason);
            });
    }

    private async _fcmSendSilent(event: NotificationData, tokens: any[]) {
        this.messaging
            .sendEachForMulticast({
                tokens: tokens,
                data: event.data,
                android: {
                    priority: 'high',
                    ttl: 0,
                },
            })
            .then(async (reason) => {
                await this._afterFcmSendMsg(reason, event);
            })
            .catch((reason) => {
                console.log(reason);
            });
    }



    private async _oneSignalPush(event: NotificationData, tokens: any[]) {
        const notification: CreateNotificationBody = {
            "included_segments": [
                "include_player_ids"
            ],
            "priority": 10,
            "include_player_ids": tokens,
            headings: {"en": event.title},
            "contents": {
                "en": event.body
            },
            "content_available": true,
            data: event.data

        };
        this.onesignalClient.createNotification(notification)
            .then(response => {
                //console.log(response)
            })
            .catch(e => {
                console.log(e);
            });
    }

    private async _afterFcmSendMsg(reason, event) {
        // let tokensToDelete = [];
        // for (let x = 0; x < reason.responses.length; x++) {
        //     if (!reason.responses[x].success) {
        //         // console.log(reason.responses[x]);
        //         let err = reason.responses[x]["error"]["code"];
        //         let errInfo = reason.responses[x]["error"]["errorInfo"]["code"];
        //         if (fcmErrorCodes.includes(err) || fcmErrorCodes.includes(errInfo)) {
        //             //  console.log("Fcm Token is" + err);
        //             let token = event.tokens[x];
        //             tokensToDelete.push(token);
        //         }
        //         //  console.log(token);
        //     }
        // }
        // if (tokensToDelete.length != 0) {
        //     console.log("start delete tokens " + tokensToDelete);
        //     await this.userDevice.deleteFcmTokens(tokensToDelete);
        // }
    }




    @OnEvent("send.all.voip")
    async sendPushKid(event: any) {
        let tokens: string[] = event["tokens"];
        let model: PushCallDataModel = event["model"];
        const options = {
            token: {
                key: path.join(root.path, "AuthKey.p8"), // Path to your .p8 file
                keyId: this.config.getOrThrow("apnKeyId"), // Key ID from your Apple Developer account
                teamId: this.config.getOrThrow("appleAccountTeamId"), // Team ID from your Apple Developer account
            },
            production: false, // Set to true for production
        };
        const apnProvider = new apn.Provider(options);
        const notification = new apn.Notification();
        notification.topic = this.config.getOrThrow("apnAppBundle") + '.voip';
        let caller_name = model.userName
        let callStatus = null;
        if (model.groupName) {
            caller_name = `${model.userName} : ${model.groupName}`
        }
        notification.payload = {
            "handle": caller_name,
            "caller_name": caller_name,
            "session_id": uuidv4(),
            "is_ending": model.callStatus != CallStatus.Ring,
            "call_status": model.callStatus  ,
            "callPhoto": "https://api.superupdev.online/" + model.userImage,
            "signal_type": callStatus,
            call_type: model.withVideo ? 1 : 0, // Example: 1 for audio call, 2 for video call
            user_info: JSON.stringify(model),
        };
        apnProvider.send(notification, tokens).then((response) => {
            console.log(response['failed'][0]);
        });
    }
}
