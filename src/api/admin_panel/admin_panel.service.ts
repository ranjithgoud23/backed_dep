/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from "@nestjs/common";
import {UpdateConfigDto} from "./dto/update_config_dto";
import {AppConfigService} from "../app_config/app_config.service";
import {UserService} from "../user_modules/user/user.service";
import {FileUploaderService} from "../../common/file_uploader/file_uploader.service";
import {ConfigService} from "@nestjs/config";
import {UserDeviceService} from "../user_modules/user_device/user_device.service";
import {newMongoObjId} from "../../core/utils/utils";
import {MongoIdDto} from "../../core/common/dto/mongo.id.dto";
import {CreateNewVersionDto, GetVersionDto} from "./dto/admin_dto";
import {CreateAdminNotificationDto} from "../admin_notification/dto/create-admin_notification.dto";
import {UserAdminService} from "./other/user_admin.service";
import {UserCountryAdminService} from "./other/user_country_admin.service";
import {VersionsAdminService} from "./other/versions_admin.service";
import {UserDeviceAdminService} from "./other/user_device_admin.service";
import {SocketIoService} from "../../chat/socket_io/socket_io.service";
import {ChannelAdminService} from "./other/channel_admin_service";
import {ChannelService} from "../../chat/channel/services/channel.service";
import {MessageService} from "../../chat/message/message.service";
import {MessagesSearchDto} from "../../chat/message/dto/messages_search_dto";
import {ReportSystemService} from "../report_system/report_system.service";
import {PaginationParameters} from "mongoose-paginate-v2";
import {Platform, UserRole} from "../../core/utils/enums";
import {AdminNotificationService} from "../admin_notification/admin_notification.service";
import {NotificationEmitterAdminService} from "./other/notification_emitter_admin.service";


@Injectable()
export class AdminPanelService {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly userService: UserService,
        private readonly socket: SocketIoService,
        private readonly fileUploaderService: FileUploaderService,
        private readonly versionsAdminService: VersionsAdminService,
        private readonly configService: ConfigService,
        private readonly userDeviceService: UserDeviceService,
        private readonly userDeviceAdminService: UserDeviceAdminService,
        private readonly countryAdminService: UserCountryAdminService,
        private readonly userAdminService: UserAdminService,
        private readonly channelAdminService: ChannelAdminService,
        private readonly channelService: ChannelService,
        private readonly messageService: MessageService,
        private reportSystemService: ReportSystemService,
        private emitterAdminService: NotificationEmitterAdminService,
        private adminNotificationService: AdminNotificationService,
        private readonly uploaderService: FileUploaderService,
    ) {
    }

    async updateConfig(dto: UpdateConfigDto) {
        let config = await this.appConfigService.getConfig();
        if (!config) throw new Error("Config not found");
        return await this.appConfigService.insert({
            ...config,
            ...dto,
            _id: newMongoObjId().toString()
        });
    }

    async getAppConfig() {
        return this.appConfigService.getConfig();
    }

    async setNewVersion(dto: CreateNewVersionDto) {
        return this.versionsAdminService.setNewVersion(dto)
    }

    async getVersions(platform: GetVersionDto) {
        return this.versionsAdminService.getVersions(platform);
    }

    async deleteVersion(id: MongoIdDto) {
        return this.versionsAdminService.deleteVersion(id);
    }

    async createNotification(dto: CreateAdminNotificationDto) {
        if (dto.imageBuffer) {
            dto.imageUrl = await this.uploaderService.putImageCropped(dto.imageBuffer, "admin");
        }
        await this.adminNotificationService.create(dto)
        await this.emitterAdminService.emitNotification(dto)
        return "Done"
    }


    async getUserInfo(dto: MongoIdDto) {
        let isOnline = await this.socket.getOnlineFromList([dto.id])
        let data = await this.countryAdminService.getUserCountries(dto.id);
        let userCountries = [];
        for (let i of data) {
            try {
                userCountries.push(i["data"][0]);
            } catch (err) {
                console.log("Error while get userCountryService getCountriesInfo for loop!");
            }
        }

        return {
            "userInfo": {
                ...(await this.userService.findById(dto.id, null, {
                    populate: "countryId"
                })),
                "isOnline": isOnline.length > 0
            },
            "visits": await this.userDeviceAdminService.getUserVisits(dto.id),
            "userDevices": await this.userDeviceService.findAll({
                uId: dto.id
            }),
            "userCountries": userCountries,
            "userReports": await this.reportSystemService.findAll({
                targetId: dto.id,
                isDeleted: false
            }, null, {
                populate: {
                    path: "uId",
                    select: "fullName verifiedAt userImage registerStatus banTo lastSeenAt bio"
                },
                limit: 30,
            }),
            "chats": {
                "messagesCounter": await this.channelAdminService.getMessagesCounterForPeer(dto.id),
                "roomCounter": await this.channelAdminService.getRoomCounterForPeer(dto.id)
            }
        };
    }

    async getUsers(dto: Object) {
        return this.userAdminService.getUsers(dto);
    }

    async getUsersDashboardInfo() {
        return {
            "usersData": await this.userAdminService.getUsersData(),
            "usersDevices": await this.userDeviceAdminService.getUsersDevicesInfo(),
            "statistics": {
                "visits": await this.userDeviceAdminService.getTotalVisits(),
                "iosVisits": await this.userDeviceAdminService.getPlatformVisits(Platform.Ios),
                "androidVisits": await this.userDeviceAdminService.getPlatformVisits(Platform.Android),
                "webVisits": await this.userDeviceAdminService.getPlatformVisits(Platform.Web),
                "otherVisits": await this.userDeviceAdminService.getPlatformVisits(Platform.Other),
            },
            "usersCountries": await this.countryAdminService.getCountriesInfo()
        };
    }

    async getNotification() {
        return this.adminNotificationService.findAll({}, null, {sort: "-_id"})
    }

    async getUserChats(peerId: string, filter: object) {
        return this.channelService.getRoomsLimited(filter, peerId)
        ///there are two type of notification users join admin push
    }


    async getCountriesInfo() {
        return this.countryAdminService.getCountriesInfo();
    }

    async getChatDashboardInfo() {
        return {
            "messagesCounter": await this.channelAdminService.getMessagesCounter(),
            "roomCounter": await this.channelAdminService.getRoomCounter()
        }
    }

    async updateUserInfo(id: string, body: object) {
        let user = await this.userService.findByIdOrThrow(id)
        if (body['hasBadge'] == true) {
            body['roles'] = [...user.roles, UserRole.HasBadge]
        }
        if (body['hasBadge'] == false) {
            body['roles'] = [...user.roles]
            body['roles'] = body['roles'].filter((item: UserRole) => item !== UserRole.HasBadge);
        }
        await this.userAdminService.updateUserData(id, body)
        return "Done"
    }

    async getUserChatsMessages(userId: string, roomId: string, filter: object) {
        let dto = new MessagesSearchDto()
        dto.lastId = filter['lastId']
        dto.limit = filter['limit']
        return this.messageService.findAllMessagesAggregation(newMongoObjId(userId), newMongoObjId(roomId), dto)
    }

    async getUserReports(dto: object) {
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 50,
                    page: 1,
                    sort: "-_id",
                    ...dto,
                    populate: [
                        {
                            path: 'uId',
                            select: "fullName verifiedAt userImage registerStatus banTo lastSeenAt bio"
                        },
                        {
                            path: 'targetId',
                            select: "fullName verifiedAt userImage registerStatus banTo lastSeenAt bio"
                        }
                    ]
                },

            }
        ).get()
        delete dto['limit']
        delete dto['page']
        paginationParameters[0] = dto;

        return this.reportSystemService.paginate(paginationParameters)
    }

    async deleteReport(id: string) {
        await this.reportSystemService.findByIdAndDelete(id)
        return "Done"
    }

    async getUsersLog() {
        return this.userAdminService.getUsersLog()
    }

    async login(x) {
        return {
            isViewer: x
        }
    }

    async getDashboard() {
        return {
            ...await this.getUsersDashboardInfo(),
            ...await this.getChatDashboardInfo(),
        }
    }
}
