/**
 * Copyright 2023, the hatemragab project.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 *
 * This service handles all the logic related to call functionality,
 * including creating calls, accepting, rejecting, canceling, and
 * various notifications over Socket.IO.
 */

import {BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';

import {CallStatus, MessageType, RoomType, SocketEventsType,} from '../../../core/utils/enums';
import {RoomMiddlewareService} from '../../room_middleware/room_middleware.service';
import {IRoomMember} from '../../room_member/entities/room_member.entity';
import {SchedulerRegistry} from '@nestjs/schedule';
import {CreateCallMemberDto} from './dto/create-call_member.dto';
import {AcceptCallMemberDto} from './dto/accept-call_member.dto';
import {CallMemberService} from '../call_member/call_member.service';
import {UserService} from '../../../api/user_modules/user/user.service';
import {SocketIoService} from '../../socket_io/socket_io.service';
import {UserBanService} from '../../../api/user_modules/user_ban/user_ban.service';
import {MessageService} from '../../message/message.service';
import {newMongoObjId} from '../../../core/utils/utils';
import {getMsgDtoObj} from '../../channel/chat.helper';
import {MongoCallIdDto} from '../../../core/common/dto/mongo.call.id.dto';
import {SendMessageDto} from '../../channel/dto/send.message.dto';
import {IUser} from '../../../api/user_modules/user/entities/user.entity';
import {AppConfigService} from '../../../api/app_config/app_config.service';
import {i18nApi} from '../../../core/utils/res.helpers';
import {CallEmitter} from './call_emitter';
import {AgoraService} from '../../agora/agora.service';
import {MongoRoomIdDto} from '../../../core/common/dto/mongo.room.id.dto';
import {MongoIdDto} from '../../../core/common/dto/mongo.id.dto';
import {CallHistoryService} from "../call_history/call_history.service";
import {ICallHistory} from "../call_history/call.history.entity";
import {RoomMemberService} from "../../room_member/room_member.service";
import {GroupMemberService} from "../../group_member/group_member.service";
import {UserGlobalCallStatus} from "../utils/user-global-call-status.model";

@Injectable()
export class CallService {
    constructor(
        private readonly userService: UserService,
        private readonly callHistory: CallHistoryService,
        private readonly socket: SocketIoService,
        private readonly userBanService: UserBanService,
        private readonly callMemberService: CallMemberService,
        private readonly middlewareService: RoomMiddlewareService,
        private schedulerRegistry: SchedulerRegistry,
        private messageService: MessageService,
        private groupMemberService: GroupMemberService,
        private appConfigService: AppConfigService,
        private ioService: SocketIoService,
        private readonly notificationService: CallEmitter,
        private readonly roomMember: RoomMemberService,
        private readonly agoraService: AgoraService,
    ) {
    }

    /**
     * Creates a new call. If it's a group call, it immediately sends a notification
     * to the group. For a single (direct) call, it checks for any existing active calls
     * and throws an exception if the peer is already in a call.
     */
    async createCall(dto: CreateCallMemberDto) {

        // Retrieve app configuration and check if the caller is banned or not.
        const [appConfig, roomMember] = await Promise.all([
            this.appConfigService.getConfig(),
            this.isThereRoomMemberAndNotBanedOrThrow(dto.roomId, dto.myUser._id),
        ]);

        // Check if calling is allowed in the application configuration.
        if (!appConfig.allowCall) {
            throw new BadRequestException(i18nApi.callNotAllowedString);
        }
        let activeRing = await this.userService.findById(dto.myUser._id,"userGlobalCallStatus");
        if (activeRing.userGlobalCallStatus) {
            if(activeRing.userGlobalCallStatus.callId){
                return {callId: activeRing.userGlobalCallStatus.callId}
            }
        }
        // If it's a GroupChat, create a group call notification message and return.
        if (roomMember.rT == RoomType.GroupChat) {
            let callId = await this.createGroupCallNotify(dto, roomMember);
            return {callId};
        }

        // Otherwise, if it's not a single (direct) room, throw an exception.
        if (roomMember.rT !== RoomType.Single) {
            throw new NotFoundException('This is not a Direct room!');
        }


        let peerUser = await this.userService.findByIdOrThrow(roomMember.pId, "userGlobalCallStatus");

        if (peerUser.userGlobalCallStatus && peerUser.userGlobalCallStatus.roomId) {
            if (dto.roomId != peerUser.userGlobalCallStatus.roomId.toString()) {
                // If the peer is already in different a call, throw an exception.
                throw new BadRequestException(i18nApi.peerUserInCallNowString);
            }
        }
        // Create an initial message indicating the call is ringing.
        let callId = await this.ringForSingle(dto, peerUser._id);
        // Create caller instance
        let caller = new UserGlobalCallStatus(
            true,    // isCaller
            callId,
            dto.myUser._id,
            dto.roomId,
            new Date()
        );


        let callee = new UserGlobalCallStatus(
            false,   // isCaller
            callId,
            dto.myUser._id,
            dto.roomId,
            new Date()
        );
        await this.updateCallStatusForUser(dto.myUser._id, caller);
        await this.updateCallStatusForUser(peerUser._id, callee);
        await this.registerMissedCall(dto, callId, peerUser._id, appConfig.callTimeout);
        return {callId};
    }

    private async registerMissedCall(
        dto: CreateCallMemberDto,
        callId: string,
        peerId: string,
        callTimeout: number,
    ) {
        // Prepare a "missed call" message for timeout scenario.
        const missedCallMsgDto = getMsgDtoObj({
            rId: dto.roomId,
            mT: MessageType.Call,
            att: {
                callStatus: CallStatus.Timeout,
                startAt: new Date(),
                withVideo: dto.withVideo,
                endAt: null,
            },
            content: `📞 Missed Call from ${dto.myUser.fullName}`,
            user: dto.myUser,
        });

        // Register a timeout to handle call unanswered scenario.
        this.schedulerRegistry.addTimeout(
            `${callId}_call`,
            setTimeout(() => this._timeoutRing(peerId, callId, missedCallMsgDto), callTimeout),
        );
    }

    private async ringForSingle(dto: CreateCallMemberDto, peerId: string) {
        let call = await this.callHistory.create({
            caller: dto.myUser._id,
            callee: peerId,
            withVideo: dto.withVideo,
            meetPlatform: dto.meetPlatform,
            roomId: dto.roomId,
            callStatus: CallStatus.Ring,
            participants: [
                dto.myUser._id,
                peerId
            ],
            roomType: RoomType.Single,

        });
        await this.callMemberService.create({
            callId: call._id,
            userId: dto.myUser._id,
            roomId: dto.roomId,
            userDeviceId: dto.myUser.currentDevice._id,
        })

        await this.notificationService.singleRingNotify(peerId, {
            roomType: RoomType.Single,
            callId: call._id,
            roomId: dto.roomId,
            callerId: call.caller,
            withVideo: dto.withVideo,
            groupName: null,
            userName: dto.myUser.fullName,
            userImage: dto.myUser.userImage,
            callStatus: CallStatus.Ring,
        });

        return call._id;
    }


    /**
     * Retrieves the ringing call (if any) for a given user (callee).
     */
    async getRingCall(userId: string) {
        // Find any Meet entry where userId is the callee and callStatus is 'Ring'.
        const call = await this.callHistory.findOne({
            participants: userId,
            caller: {$ne: userId},
            callStatus: {$eq: CallStatus.Ring},
        });

        if (!call) return null;
        let peerRoomMember = await this.roomMember.findOne({
            rId: call.roomId,
            uId: call.caller,
        })
        if (call.roomType == RoomType.GroupChat) {
            return {
                call,
                roomMember: peerRoomMember,
            };
        }

        // Return minimal data needed to accept or reject the call.
        return {
            call,
            // displayData: callerProfile,
            roomMember: peerRoomMember,
        };
    }

    /**
     * Cancels a call that is in 'Ring' status. Only the caller can cancel the call.
     */
    async cancelCall(dto: MongoCallIdDto, call: ICallHistory) {
        // Update the call status to 'Canceled'.
        await this.callHistory.findByIdAndUpdate(call._id, {
            callStatus: CallStatus.Canceled,
        });
        let isGroup = call.roomType == RoomType.GroupChat
        if (isGroup) {
            await this.notificationService.groupRingNotify({
                roomType: call.roomType,
                roomId: call.roomId,
                callId: call._id,
                callerId: call.caller,
                withVideo: call.withVideo,
                groupName: "CANCEL CALL",
                userName: dto.myUser.fullName,
                userImage: dto.myUser.userImage,
                callStatus: CallStatus.Canceled,
            });
        } else {
            await this.notificationService.singleRingNotify(call.callee, {
                roomType: call.roomType,
                roomId: call.roomId,
                callId: call._id,
                callerId: call.caller,
                withVideo: call.withVideo,
                groupName: null,
                userName: dto.myUser.fullName,
                userImage: dto.myUser.userImage,
                callStatus: CallStatus.Canceled,
            });
        }

        return 'Call canceled';
    }


    /**
     * Ends a call that is currently 'InCall'. Either the caller or callee can end the call.
     * Once ended, notifies all clients in the room that the call has finished.
     */
    async endCallForSingle(dto: MongoCallIdDto, call: ICallHistory) {
        const current = new Date();
        // Update the call to 'Finished' and record the end time.
        await Promise.all([
            this.callHistory.findByIdAndUpdate(dto.callId, {
                callStatus: CallStatus.Finished,
                endAt: current,
            }),
            this.socket.io.to(call.roomId.toString()).emit(
                SocketEventsType.v1OnCallEnded,
                JSON.stringify({
                    callId: dto.callId,
                    roomId: call.roomId,
                }),
            ),
        ]);

        // Create a message indicating the call has finished.
        const finishedMsgDto = getMsgDtoObj({
            rId: call.roomId,
            mT: MessageType.Call,
            att: {
                callStatus: CallStatus.Finished,
                withVideo: call.withVideo,
                endAt: current,
                startAt: call.createdAt,
            },
            content: `📞`,
            user: dto.myUser,
        });

        // Persist the message in DB and notify all clients in the room.
        const newMessage = await this.messageService.create(finishedMsgDto);
        this.socket.io
            .to(call.roomId.toString())
            .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMessage));

        return 'Call ended'; // Possibly meant to be "Call ended".
    }

    /**
     * Accepts a ringing call. Only the callee can accept.
     * Transitions the call status from 'Ring' to 'InCall'.
     */
    async acceptCall(dto: AcceptCallMemberDto) {
        const call = await this.callHistory.findOne({_id: dto.callId, participants: dto.myUser._id});
        if (!call) throw new BadRequestException('You dont have any call to acceptCall you are not participating in ' + call);
        // The call must be ringing in order to accept.

        // @ts-ignore
        let ifCanAccept = call.callStatus !== CallStatus.Ring || call.callStatus !== CallStatus.InCall

        if (ifCanAccept) {
            throw new BadRequestException('Call status not ring! to be acceptCall ' + call.callStatus);
        }

        // Only the designated callee can accept.
        if (call.caller.toString() == dto.myUser._id.toString()) {
            throw new BadRequestException('Only the callee can accept this call!');
        }

        // Confirm the user is not banned or removed from the room.
        let rM = await this.isThereRoomMemberAndNotBanedOrThrow(call.roomId, dto.myUser._id);
        let isGroup = rM.rT == RoomType.GroupChat

        // Add this user as a call member and update the meet status to 'InCall'.
        const callMemberCreation = this.callMemberService.create({
            callId: call._id,
            userId: dto.myUser._id,
            roomId: call.roomId,
            userDeviceId: dto.myUser.currentDevice._id,
        });
        const callUpdated = this.callHistory.findByIdAndUpdate(dto.callId, {
            callStatus: CallStatus.InCall,
        });

        await Promise.all([callMemberCreation, callUpdated]);
        if (isGroup) {
            return {callId: dto.callId};
        }
        // Retrieve the caller's callMember entry to get their device ID.
        const peerUserCallMember = await this.callMemberService.findOne({
            callId: dto.callId,
            userId: call.caller,
        });

        // Find the socket connection of the caller.
        const peerSocket = await this.ioService.getSocketByDeviceId(
            peerUserCallMember.userDeviceId,
        );

        // If the caller is offline, set the call status to 'Timeout'.
        if (!peerSocket) {
            await this.callHistory.findByIdAndUpdate(dto.callId, {
                callStatus: CallStatus.Offline,
            });
            throw new BadRequestException(i18nApi.peerUserDeviceOfflineString);
        }

        // Notify the caller that their call has been accepted.
        peerSocket.emit(
            SocketEventsType.v1OnCallAccepted,
            JSON.stringify({
                callId: dto.callId,
                roomId: call.roomId,
                peerAnswer: dto.payload, // Contains any additional offer/answer data.
            }),
        );

        return {callId: dto.callId};
    }

    /**
     * Rejects a ringing call. Only the callee can reject.
     */
    async rejectCallForSingle(dto: MongoCallIdDto, call: ICallHistory) {
        // Update call status to 'Rejected'.
        await this.callHistory.findByIdAndUpdate(call._id, {
            callStatus: CallStatus.Rejected,
        });

        // Notify the caller that the call is rejected.
        this.socket.io.to(call.caller.toString()).emit(
            SocketEventsType.v1OnCallRejected,
            JSON.stringify({
                callId: dto.callId,
                roomId: call.roomId,
            }),
        );

        // Create and broadcast a "rejected" message.
        const rejectMsgDto = getMsgDtoObj({
            rId: call.roomId,
            mT: MessageType.Call,
            att: {
                callStatus: CallStatus.Rejected,
                withVideo: call.withVideo,
            },
            content: `📞`,
            user: dto.myUser,
        });
        const newMessage = await this.messageService.create(rejectMsgDto);
        this.socket.io
            .to(call.roomId.toString())
            .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMessage));

        return 'Call rejected';
    }

    /**
     * Called by a timer if the call remains in 'Ring' status for too long.
     * Automatically sets the call status to 'Timeout' and notifies relevant parties.
     */
    private async _timeoutRing(peerId: string, callId: string, missedDto: SendMessageDto) {
        const call = await this.callHistory.findByIdOrThrow(callId);
        // Only handle if the call is still 'Ring'.
        if (call.callStatus == CallStatus.Ring) {
            await this.callHistory.findOneAndUpdate({_id: callId}, {
                callStatus: CallStatus.Timeout,
            });

            const newMessage = await this.messageService.create(missedDto);
            await this.updateCallStatusForUser(peerId, UserGlobalCallStatus.createEmpty());
            await this.updateCallStatusForUser(missedDto.myUser._id, UserGlobalCallStatus.createEmpty());
            // Notify everyone in the room that the call timed out.
            this.socket.io
                .to(missedDto._roomId.toString())
                .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMessage))
            // // Optional push notification for the peer about the missed call.
            await this.notificationService.singleChatNotification(peerId, newMessage);
        }
    }


    /**
     * Retrieves an Agora token or access object for a given room, ensuring the user
     * is allowed in the room.
     */
    async getAgoraAccess(dto: MongoRoomIdDto) {
        await this.isThereRoomMemberAndNotBanedOrThrow(dto.roomId, dto.myUser._id);
        return this.agoraService.getAgoraAccessNew(dto.roomId, true);
    }

    /**
     * A unified endpoint to handle ending a call from either side,
     * while it is either 'Ring' or 'InCall', without needing separate endpoints.
     */
    async endCallV2(dto: MongoCallIdDto) {
        const call = await this.callHistory.findOne({_id: dto.callId, participants: dto.myUser._id});
        if (!call) throw new BadRequestException('You dont have any call to endCallV2 you are not participating in ' + call);
        let rM = await this.isThereRoomMemberAndNotBanedOrThrow(call.roomId, dto.myUser._id);
        const myId = dto.myUser._id.toString();


        await this.updateCallStatusForUser(call.callee, UserGlobalCallStatus.createEmpty());
        await this.updateCallStatusForUser(myId, UserGlobalCallStatus.createEmpty());

        if (rM.rT == RoomType.GroupChat) {
            if (call.caller.toString() == myId && call.callStatus == CallStatus.Ring) {
                return this.cancelCall(dto, call);
            }
            return;
        }

        // If the current user is the caller:
        if (call.caller.toString() == myId) {
            // If it's still ringing, cancel. Otherwise, end.
            if (call.callStatus == CallStatus.Ring) {
                return this.cancelCall(dto, call);
            }
        } else {
            if (call.callStatus == CallStatus.Ring) {
                return this.rejectCallForSingle(dto, call);
            }
        }
        // The current user is the callee:
        // If it's still ringing, reject. Otherwise, end.


        if (call.callStatus == CallStatus.InCall) {
            return this.endCallForSingle(dto, call);
        }
        return "No action done"
    }

    /**
     * Retrieves the call history for the specified user.
     * Excludes calls that have been soft-deleted by that user.
     */
    async getCallsHistory(user: IUser) {
        // Fetch calls where the user is either the caller or callee and hasn't marked it as deleted.
        return await this.callHistory.findAll(
            {
                $and: [
                    {
                        participants: user._id.toString(),
                    },
                    {
                        deleteFrom: {$ne: newMongoObjId(user._id)},
                    },
                ],
                callStatus: {$in: [CallStatus.Canceled, CallStatus.Finished, CallStatus.Rejected]},
            },
            "-participants -deleteFrom",
            {
                limit: 30,
                sort: '-_id',
                populate: [
                    {
                        path: 'callee',
                        select: 'fullName userImage',
                    },
                    {
                        path: 'caller',
                        select: 'fullName userImage',
                    },
                    {
                        path: 'roomId',
                        select: '_id gName gImg',
                    },
                ],
            },
        );

        // // Format the returned data to highlight the peerUser in each call.
        // const result = [];
        // for (let i = 0; i < data.length; i++) {
        //     const item = data[i];
        //     const peerUser =
        //         user._id.toString() == item.caller._id.toString()
        //             ? item.callee
        //             : item.caller;
        //
        //     result.push({
        //         callStatus: item.callStatus,
        //         roomId: item.roomId,
        //         withVideo: item.withVideo,
        //         meetPlatform: item.meetPlatform,
        //         endAt: item.endAt,
        //         createdAt: item.createdAt,
        //         _id: item._id,
        //         peerUser,
        //     });
        // }

    }

    /**
     * Soft-deletes all call history for the given user.
     * Adds the user ID to the 'deleteFrom' array so these calls are not returned in subsequent queries.
     */
    async deleteAllHistory(user: IUser) {
        await this.callHistory.updateMany(
            {
                participants: user._id
            },
            {
                $addToSet: {
                    deleteFrom: newMongoObjId(user._id),
                },
            },
        );
        return 'Done';
    }

    /**
     * Soft-deletes a single call record for the user by ID.
     */
    async deleteOneHistory(dto: MongoIdDto) {
        await this.callHistory.findByIdAndUpdate(dto.id, {
            $addToSet: {
                deleteFrom: newMongoObjId(dto.myUser._id),
            },
        });
        return 'Done';
    }

    /**
     * Checks if a user is a member of a given room and is not banned.
     * Throws an exception if the user is not a member or is banned.
     */
    async isThereRoomMemberAndNotBanedOrThrow(
        roomId: string,
        userId: string,
    ): Promise<IRoomMember> {
        // Verify that the user is a member of the room.
        const roomMember = await this.middlewareService.isThereRoomMemberOrThrow(
            roomId,
            userId,
        );

        // Check if the user is banned in that room.
        const ban = await this.userBanService.getBan(roomMember.pId, roomMember.uId);
        if (ban) {
            throw new BadRequestException('You do not have access (banned).');
        }

        return roomMember;
    }


    /**
     * Creates a notification for group calls. Sends out a message to everyone in the group
     * indicating that a call has started.
     */
    private async createGroupCallNotify(dto: CreateCallMemberDto, rM: IRoomMember) {
        let users = await this.groupMemberService.findAll({
            rId: dto.roomId,
        }, "uId")

        let call = await this.callHistory.create({
            caller: dto.myUser._id,
            callee: null,
            withVideo: dto.withVideo,
            meetPlatform: dto.meetPlatform,
            roomId: dto.roomId,
            callStatus: CallStatus.Ring,
            participants: users.map((value: { [x: string]: any; }) => value['uId']),
            roomType: RoomType.GroupChat,

        });
        await this.callMemberService.create({
            callId: call._id,
            userId: dto.myUser._id,
            roomId: dto.roomId,
            userDeviceId: dto.myUser.currentDevice._id,
        })

        this.notificationService.groupRingNotify({
            roomType: RoomType.GroupChat,
            callerId: call.caller,
            callId: call._id,
            roomId: dto.roomId,
            withVideo: dto.withVideo,
            groupName: rM.t,
            userName: dto.myUser.fullName,
            userImage: rM.img,
            callStatus: CallStatus.Ring,
        }).then(value => {
        });


        // Build a message about the group call.
        const ringMsgDto = getMsgDtoObj({
            rId: dto.roomId,
            mT: MessageType.Call,
            att: {
                callStatus: CallStatus.Ring,
                startAt: new Date(),
                withVideo: dto.withVideo,
                endAt: null,
            },
            content: `📞 New call from ${rM.t} 👥`,
            user: dto.myUser,
        });

        // Save the message and broadcast to the group room.
        const newMessage = await this.messageService.create(ringMsgDto);
        this.socket.io
            .to(newMessage.rId.toString())
            .emit(SocketEventsType.v1OnNewMessage, JSON.stringify(newMessage));
        return call._id;
    }

    private async updateCallStatusForUser(userId : any, dto: UserGlobalCallStatus) {
        if (!userId) return
        await this.userService.findByIdAndUpdate(userId, {
            userGlobalCallStatus: dto
        })
    }
}