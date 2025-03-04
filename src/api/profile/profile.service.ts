/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {BadRequestException, Injectable} from "@nestjs/common";
import {UserService} from "../user_modules/user/user.service";
import {remove} from "remove-accents";

import bcrypt from "bcrypt";
import {UserDeviceService} from "../user_modules/user_device/user_device.service";
import {UserBanService} from "../user_modules/user_ban/user_ban.service";
import {IUser} from "../user_modules/user/entities/user.entity";
import {VersionsService} from "../versions/versions.service";
import {FileUploaderService} from "../../common/file_uploader/file_uploader.service";
import {MongoIdDto} from "../../core/common/dto/mongo.id.dto";
import UpdatePasswordDto from "./dto/update_password_dto";
import CheckVersionDto from "./dto/check-version.dto";
import {
    UpdateChatReqStatusDto,
    UpdateMyBioDto,
    UpdateMyNameDto,
    UpdateMyPasswordDto,
    UpdateMyPrivacyDto
} from "./dto/update.my.name.dto";
import {AppConfigService} from "../app_config/app_config.service";
import {MongoPeerIdDto} from "../../core/common/dto/mongo.peer.id.dto";
import {RoomMemberService} from "../../chat/room_member/room_member.service";
import {GroupMemberService} from "../../chat/group_member/group_member.service";
import {BroadcastMemberService} from "../../chat/broadcast_member/broadcast_member.service";
import {UserVersionService} from "../user_modules/user_version/user_version.service";
import {CreateReportSystemDto} from "../report_system/dto/create-report_system.dto";
import {ReportSystemService} from "../report_system/report_system.service";
import {AdminNotificationService} from "../admin_notification/admin_notification.service";
import {SocketIoService} from "../../chat/socket_io/socket_io.service";
import {AuthService} from "../auth/auth.service";
import {PaginationParameters} from "mongoose-paginate-v2";
import {NotificationEmitterService} from "../../common/notification_emitter/notification_emitter.service";
import {ChatRequestStatus, Platform, PushTopics, RoomType} from "../../core/utils/enums";
import {i18nApi} from "../../core/utils/res.helpers";
import {ChatRequestService} from "../../chat/chat_request/chat_request.service";
import {ChannelService} from "../../chat/channel/services/channel.service";
import {ProfileNotificationEmitter} from "./profile_notification_emitter";


@Injectable()
export class ProfileService {
    constructor(
        private readonly userService: UserService,
        private readonly userDevice: UserDeviceService,
        private readonly authService: AuthService,
        private readonly banServer: UserBanService,
        private readonly ioService: SocketIoService,
        private s3: FileUploaderService,
        private notificationEmitterService: NotificationEmitterService,
        private versionsService: VersionsService,
        private appConfigService: AppConfigService,
        private reportSystemService: ReportSystemService,
        private readonly roomMemberService: RoomMemberService,
        private readonly groupMember: GroupMemberService,
        private readonly userVersion: UserVersionService,
        private readonly broadcastMember: BroadcastMemberService,
        private readonly adminNotificationService: AdminNotificationService,
        private readonly chatRequestService: ChatRequestService,
        private readonly channelService: ChannelService,
        private readonly profileNotificationEmitter: ProfileNotificationEmitter,
    ) {
    }


    async getMyProfile(user: IUser) {
        let res = {};
        res["me"] = await this.userService.findById(user._id, "-lastMail");
        res["currentDevice"] = await this.userDevice.findById(user.currentDevice._id, "platform language clintVersion");
        return res;
    }

    async getPeerProfile(dto: MongoIdDto) {
        let res = {};
        let user = await this.userService.findByIdOrThrow(dto.id, "userImage fullName email userPrivacy bio lastSeenAt createdAt hasBadge");
        let chatReq = await this.chatRequestService.findOne({
            $or: [
                {receiverId: dto.myUser._id},
                {senderId: dto.myUser._id},
            ],
            roomType: RoomType.Single,
        })
        res = {
            ...user,
            ...await this.banServer.checkBans(new MongoPeerIdDto(dto.id, dto.myUser)),
            isOnline: await this.ioService.checkIfUserOnline(dto.id),
            chatReq: chatReq,
        }
        return res;
    }

    async updateMyName(dto: UpdateMyNameDto) {
        await this.userService.findByIdAndUpdate(dto.myUser._id, {
            fullName: dto.fullName,
            fullNameEn: remove(dto.fullName)
        });
        await this.roomMemberService.updateMany({
            pId: dto.myUser._id
        }, {
            t: dto.fullName,
            tEn: remove(dto.fullName)
        });
        await this.groupMember.updateMany({uId: dto.myUser._id}, {
            "userData.fullName": dto.fullName,
            "userData.fullNameEn": remove(dto.fullName)
        });
        await this.broadcastMember.updateMany({uId: dto.myUser._id}, {
            "userData.fullName": dto.fullName,
            "userData.fullNameEn": remove(dto.fullName)
        });
        return dto.fullName;
    }


    async updateMyImage(file: any, myUser: IUser) {
        let res = await this.s3.putImageCropped(file.buffer, myUser._id);
        await this.userService.findByIdAndUpdate(myUser._id, {
            userImage: res
        });

        await this.roomMemberService.updateMany({
            pId: myUser._id
        }, {
            img: res
        });
        await this.groupMember.updateMany({uId: myUser._id}, {
            "userData.userImages": res
        });
        await this.broadcastMember.updateMany({uId: myUser._id}, {
            "userData.userImages": res
        });
        return res;
    }


    async deleteFcmFor(user: IUser) {
        await this.userDevice.findByIdAndUpdate(user.currentDevice._id, {
            pushKey: null
        });
        return "Fcm deleted";
    }


    async addPushKey(myUser: IUser, pushKey?: string, voipKey?: string) {
        const updateObject: { pushKey?: string; voipKey?: string } = {};
        if (pushKey) {
            updateObject.pushKey = pushKey;
        }

        if (voipKey) {
            updateObject.voipKey = voipKey;
        }

        await this.userDevice.findByIdAndUpdate(
            myUser.currentDevice._id,
            updateObject
        );

        return "PushKey added";
    }


    async updateLanguage(myUser: IUser, language: String) {
        await this.userDevice.findByIdAndUpdate(
            myUser.currentDevice._id,
            {
                language: language
            }
        );
        return "Language has been updated";
    }


    async updatePassword(user: IUser, dto: UpdatePasswordDto) {
        let foundedUser: IUser = await this.userService.findByIdOrThrow(dto.myUser._id, "+password");
        let bcryptRes = await bcrypt.compare(dto.oldPassword, foundedUser.password);
        if (!bcryptRes) {
            throw new BadRequestException("Invalid password credentials");
        }

        if (dto.logoutFromAll) {
            await this.userDevice.deleteMany({
                uId: dto.myUser._id,
                _id: {$ne: dto.myUser.currentDevice._id}
            });
        }

        const salt = await bcrypt.genSalt(10);
        let hashed = bcrypt.hashSync(dto.newPassword, salt);
        await this.userService.findByIdAndUpdate(dto.myUser._id, {
            "password": hashed
        });
        return "Password changed successfully";
    }


    async updateFcm(user: IUser, pushKey: String) {
        let dId = user.currentDevice._id;
        await this.userDevice.findByIdAndUpdate(dId, {
            pushKey
        });
        return "updated!";
    }


    async getUsersAndSearch(dto: Object, myUser: IUser) {
        let bans = await this.banServer.getMyBlockTheyAndMe(myUser._id);
        bans.push(myUser._id);
        return this.userService.searchV2(dto, bans);
    }

    async setVisit(user: IUser) {
        await this.userDevice.findByIdAndUpdate(user.currentDevice._id, {
            $inc: {
                visits: 1
            }
        });
        return "Done"
    }


    async getMyDevices(user) {
        return this.userDevice.findAll({
            uId: user._id
        });
    }

    async getAppConfig(user) {
        return this.appConfigService.getConfig();
    }

    async getUserLastSeenAt(dto: MongoPeerIdDto) {
        let user = await this.userService.findByIdOrThrow(dto.peerId, "lastSeenAt userPrivacy");
        if (user.userPrivacy.lastSeen == false) return null
        return user.lastSeenAt;
    }

    async deleteMyAccount(user: IUser, password: string) {
        //stop notifications
        await this.checkPassword(user, password);
        await this.userService.findByIdAndUpdate(user._id, {
            deletedAt: new Date()
        });
        try {
            let device = await this.userDevice.findById(user.currentDevice._id)
            if (device.platform == Platform.Android) {
                this.notificationEmitterService.unSubscribeFcmTopic(device.pushKey ?? "--", PushTopics.AdminAndroid).then(value => {
                })
            }
            if (device.platform == Platform.Ios) {
                this.notificationEmitterService.unSubscribeFcmTopic(device.pushKey ?? "--", PushTopics.AdminIos).then(value => {
                })
            }
        } catch (e) {
            console.log(e)
        }
        return "account deleted !";
    }

    async checkVersion(dto: CheckVersionDto) {
        return this.userVersion.checkVersion(dto);
    }

    async createReport(dto: CreateReportSystemDto) {
        return this.reportSystemService.create({...dto, uId: dto.myUser._id})
    }

    async getAdminNotification(dto: Object) {
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 20,
                    page: 1,
                    sort: "-_id",
                    ...dto,
                },
            }
        ).get()
        if (paginationParameters[1].page <= 0) {
            paginationParameters[1].page = 1
        }
        if (paginationParameters[1].limit <= 0 || paginationParameters[1].limit >= 50) {
            paginationParameters[1].limit = 20
        }
        return this.adminNotificationService.paginate(paginationParameters)
    }

    async updateMyBio(dto: UpdateMyBioDto) {
        await this.userService.findByIdAndUpdate(dto.myUser._id, {
            bio: dto.bio
        });
        return dto.bio
    }

    async updateMyPassword(dto: UpdateMyPasswordDto) {
        let foundedUser: IUser = await this.userService.findById(
            dto.myUser._id,
            "+password userDevice lastMail banTo email registerStatus"
        );
        await this.authService.comparePassword(dto.oldPassword, foundedUser.password)
        await this.userService.findByIdAndUpdate(dto.myUser._id, {
            password: dto.newPassword
        })
        if (dto.logoutAll) {
            let currentDeviceId = dto.myUser.currentDevice._id
            await this.userDevice.deleteMany({
                _id: {$ne: currentDeviceId},
                uId: dto.myUser._id
            })
        }
        return "Done"
    }

    async deleteDevice(dto: MongoIdDto, password: string) {
        if (dto.myUser.currentDevice._id.toString() == dto.id) throw new BadRequestException("You cant delete your device")
        await this.checkPassword(dto.myUser, password);
        await this.userDevice.findByIdAndDelete(dto.id)
        return "Device deleted"
    }

    async getMyBlocked(user: IUser, dto: Object) {
        return await this.banServer.getMyBlockMeOnly(user._id, dto);
    }

    async checkPassword(user: IUser, password: string) {
        if (!password) throw new BadRequestException("password is required")
        let foundedUser: IUser = await this.userService.findByIdOrThrow(
            user._id,
            "+password userDevice lastMail banTo email registerStatus deletedAt"
        );
        await this.comparePassword(password, foundedUser.password)
        return true
    }

    async comparePassword(dtoPassword, dbHasPassword) {
        let bcryptRes = await bcrypt.compare(dtoPassword, dbHasPassword);
        if (!bcryptRes) {
            throw new BadRequestException(i18nApi.invalidLoginDataString);
        }
        return true
    }

    async updateMyPrivacy(dto: UpdateMyPrivacyDto) {
        await this.userService.findByIdAndUpdate(dto.myUser._id, {
            userPrivacy: dto,
        })
        return this.userService.findByIdOrThrow(dto.myUser._id)
    }

    async sendChatRequest(dto: MongoIdDto) {
        if (dto.id == dto.myUser._id) throw new BadRequestException("You can not send request to your self")
        let oldChatReq = await this.chatRequestService.findOne({
            $or: [
                {receiverId: dto.myUser._id},
                {senderId: dto.myUser._id},
            ],
            roomType: RoomType.Single,
        })
        if (oldChatReq && oldChatReq.status != ChatRequestStatus.Canceled) throw new BadRequestException("Old request already " + oldChatReq.roomType + " " + oldChatReq.status)
        let room = await this.channelService.getOrCreatePeerRoom({
            myUser: dto.myUser,
            peerId: dto.id
        });
        if (!oldChatReq) {
            await this.chatRequestService.create({
                senderId: dto.myUser._id,
                receiverId: dto.id,
                status: ChatRequestStatus.Pending,
                roomType: RoomType.Single,
                roomId: room.rId
            })
            await this.profileNotificationEmitter.notify(dto.id, dto.myUser)
        } else {
            await this.chatRequestService.findByIdAndUpdate(oldChatReq._id, {
                status: ChatRequestStatus.Pending,
            })
        }


        return "Request has been send"
    }

    async updateChatRequest(dto: MongoIdDto, status: UpdateChatReqStatusDto) {

        let chatReq = await this.chatRequestService.findByIdOrThrow(dto.id)
        if (chatReq.senderId.toString() != dto.myUser._id && chatReq.receiverId.toString() != dto.myUser._id) throw new BadRequestException("You dont have access")
        if (dto.myUser._id.toString() == chatReq.senderId.toString()) {
            ///iam the sender
            if (status.status == ChatRequestStatus.Refused) throw new BadRequestException("As sender you can not Refused")
            if (status.status == ChatRequestStatus.Pending) throw new BadRequestException("As sender you can not Pending")
            if (status.status == ChatRequestStatus.Accepted) throw new BadRequestException("As sender you can not Accepted")
        }
        if (dto.myUser._id.toString() == chatReq.receiverId.toString()) {
            ///iam the receiver
            if (status.status == ChatRequestStatus.Canceled) throw new BadRequestException("As receiver you can not Canceled")
            if (status.status == ChatRequestStatus.Pending) throw new BadRequestException("As receiver you can not Pending")
        }

        await this.chatRequestService.findByIdAndUpdate(dto.id, {
            status: status.status
        })
        return "Status has been updated"

    }

    async getMyChatRequest(user: IUser, dto: object) {
        let filter: object = {
            receiverId: user._id,
            status: {$eq: ChatRequestStatus.Pending}
        };
        let paginationParameters = new PaginationParameters({
                query: {
                    limit: 30,
                    sort: "-_id",
                    ...dto
                }
            }
        ).get();
        paginationParameters[0] = filter;
        return this.chatRequestService.paginate(paginationParameters);

    }
}
