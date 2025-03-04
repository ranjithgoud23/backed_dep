/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Injectable} from '@nestjs/common';
import {Server, Socket} from "socket.io";
import {RemoteSocket} from "socket.io/dist/broadcast-operator";
import {CallMemberService} from "../call_modules/call_member/call_member.service";
import {RoomMemberService} from "../room_member/room_member.service";
import {MessageService} from "../message/message.service";
import {UserService} from "../../api/user_modules/user/user.service";
import {RoomMiddlewareService} from "../room_middleware/room_middleware.service";
import {CallStatus, Platform, RoomType, SocketEventsType} from "../../core/utils/enums";
import {IUser} from "../../api/user_modules/user/entities/user.entity";
import {IRoomMember} from "../room_member/entities/room_member.entity";
import {newMongoObjId} from "../../core/utils/utils";
import {UserDeviceService} from "../../api/user_modules/user_device/user_device.service";
import {UserGlobalCallStatus} from "../call_modules/utils/user-global-call-status.model";

@Injectable()
export class SocketIoService {
    io: Server;

    constructor(
        private readonly roomMemberService: RoomMemberService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly deviceService: UserDeviceService,
        private readonly callMemberService: CallMemberService,
        private readonly middlewareService: RoomMiddlewareService,
        private readonly userDeviceService: UserDeviceService,
    ) {
    }

    async handleConnection(client: Socket, ...args: any[]) {
        // get my chats and join it and emit it !
        let roomsIds = await this.roomMemberService.findAll({
            uId: client.user._id,
            bId: {$eq: null}
        }, "rT rId pId", {limit: 700});
        client.join(roomsIds.map(value => value.rId.toString()));
        client.join(client.user._id.toString())
        for (let r of roomsIds) {
            if (r.rT == RoomType.Single || r.rT == RoomType.Order) {
                let res = await this.messageService.setMessageDeliverForSingleChat(client.user._id, r.rId);
                let isUpdated = res["modifiedCount"] != 0;
                if (isUpdated) {
                    this.io.to(r.rId.toString()).emit(SocketEventsType.v1OnDeliverChatRoom, JSON.stringify({
                        roomId: r.rId.toString(),
                        userId: r.pId.toString(),
                        date: new Date()
                    }));
                }
            } else if (r.rT == RoomType.GroupChat) {
                await this.messageService.setMessageDeliverForGroupChat(client.user._id, r.rId);
            }
        }
    }

    async joinRoom(args: { usersIds: any[], roomId: string }) {
        let sockets: any[] = await this.getSockets(args.usersIds);
        for (let socket of sockets) {
            socket.join(args.roomId.toString());
        }
        //const rooms = await this.io.in(args.roomId.toString()).allSockets();
        return sockets.length;
    }

    async leaveRooms(args: { usersIds: any[], roomId }) {
        let sockets: any[] = await this.getSockets(args.usersIds);
        for (let socket of sockets) {
            await socket.leave(args.roomId.toString());
        }
        return sockets.length;
    }

    async getOnlineSocketsNumber() {
        let allSockets = await this.io.fetchSockets()
        return allSockets.length
    }

    async getSockets(usersIds: any[]) {
        let allSockets = await this.io.fetchSockets();
        let sockets = [];
        allSockets.forEach((value) => {
            if (usersIds.includes(value["user"]["_id"].toString())) {
                sockets.push(value);
            }
        });
        return sockets;
    }

    async getSocketByDeviceId(deviceId: string): Promise<RemoteSocket<any, any>> {
        let allSockets = await this.io.fetchSockets();
        let socket: RemoteSocket<any, any> = null
        allSockets.forEach((value) => {
            let id = value["user"]['currentDevice']._id.toString();
            if (id == deviceId) {
                socket = value
            }
        });
        return socket;
    }

    async getOnlineRoomId(roomId: string): Promise<number> {
        let allSockets = await this.io.in(roomId).fetchSockets()
        return allSockets.length;
    }

    async getOnlineFromList(usersIds: string[]) {
        let allSockets = await this.io.fetchSockets();
        let onlineIds = [];
        for (let s of allSockets) {
            for (let id of usersIds) {
                if (id.toString() == s["user"]["_id"].toString()) {
                    onlineIds.push(s["user"]["_id"].toString());
                }
            }
            //console.log(s['request']['myUser']['_id'].toString())
        }
        return onlineIds;
    }

    async checkIfUserOnline(userId: string) {
        let allSockets = await this.io.fetchSockets();
        for (let s of allSockets) {
            if (userId.toString() == s["user"]["_id"].toString()) {
                return true;
            }
        }
        return false;
    }

    async leaveRoom(roomId: string, uId: string) {
        let sockets = await this.getSockets([uId]);
        for (let s of sockets) {
            await s.leave(roomId.toString());
        }
    }

    async myOnline(decodedList: any[]) {
        //console.log(decodedList)
        let onlineSockets = await this.getOnlineFromList(decodedList.map(data => data['peerId']));
        let res = []

        for (let item of decodedList) {
            if (onlineSockets.includes(item['peerId'])) {
                res.push({
                    peerId: item['peerId'],
                    isOnline: true,
                    extra: item['extra']
                })
            } else {
                res.push({
                    peerId: item['peerId'],
                    isOnline: false,
                    extra: item['extra']
                })
            }
        }
        // console.log(res)
        return res
    }

    async updateRoomMessagesToDeliver(roomId: any, myUser: IUser) {
        let rMember: IRoomMember = await this.middlewareService.isThereRoomMember(
            roomId,
            myUser._id,
        );
        if (!rMember) return;
        if (rMember.rT == RoomType.Single || rMember.rT == RoomType.Order) {
            let res = await this.messageService.setMessageDeliverForSingleChat(
                myUser._id,
                roomId,
            );
            let isUpdated = res['modifiedCount'] != 0;
            return {isUpdated: isUpdated, pId: rMember.pId,}
        }
        if (rMember.rT == RoomType.GroupChat) {
            await this.messageService.setMessageDeliverForGroupChat(
                myUser._id,
                roomId,
            );
        }
        return {isUpdated: false, pId: null}
    }

    async updateRoomMessagesToSeen(roomId: any, myUser: IUser) {
        let rMember: IRoomMember = await this.middlewareService.isThereRoomMember(
            roomId,
            myUser._id,
        );
        if (!rMember) return {isUpdated: false, pId: null};
        await this.roomMemberService.findOneAndUpdate({
            uId: myUser._id,
            rId: roomId.toString(),
        }, {lSMId: newMongoObjId().toString()});
        if (rMember.rT == RoomType.Single || rMember.rT == RoomType.Order) {
            let res = await this.messageService.setMessageSeenForSingleChat(
                myUser._id,
                roomId.toString(),
            );
            let isUpdated = res['modifiedCount'] != 0;
            return {isUpdated: isUpdated, pId: rMember.pId.toString()}
        } else if (rMember.rT == RoomType.GroupChat) {
            await this.messageService.setMessageSeenForGroupChat(
                myUser._id,
                roomId,
            );
        }
        return {isUpdated: false, pId: null}
    }

    async handleDisconnect(client: Socket) {
        await this._setLastSeenAt(client.user)
        let rId = client['typingTo']
        if (rId) {
            this.io
                .to(rId.toString())
                .emit(
                    SocketEventsType.v1OnRoomStatusChange,
                    JSON.stringify({
                        "roomId": rId,
                        "status": "stop",
                        "name": "",
                        "userId": client.user._id
                    }),
                );
        }
        await this._checkIfThisDeviceInCall(client.user._id, client.user.currentDevice._id);
    }

    async kickGroupMember(gId: string, peerId: string) {
        this.io
            .to(gId.toString())
            .emit(
                SocketEventsType.v1OnKickGroupMember,
                JSON.stringify({
                    "roomId": gId,
                    "userId": peerId
                }),
            );
    }


    private async _checkIfThisDeviceInCall(userId: string, deviceId: string) {
        let device = await this.userDeviceService.findById(deviceId)
        if (device.platform == Platform.Android || device.platform == Platform.Ios) {
            let theUser = await this.userService.findById(userId, "userGlobalCallStatus")
            if (theUser.userGlobalCallStatus && theUser.userGlobalCallStatus.callId) {
                await this.userService.findByIdAndUpdate(theUser._id, {
                    userGlobalCallStatus: UserGlobalCallStatus.createEmpty()
                })
            }
        }

    }


    async iceRtc(meetId: string, client: Socket) {
        // let meet = await this.meetService.findById(meetId)
        // if (meet.caller.toString() == client.user._id.toString()) {
        //     return meet.callee.toString();
        // }
        // return meet.caller.toString();
    }

    private async _setLastSeenAt(user: IUser) {
        await this.userService.setLastSeenAt(user._id);
        await this.deviceService.setLastSeenAt(user.currentDevice._id);
    }
}
