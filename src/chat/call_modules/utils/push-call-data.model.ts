// user-global-call-status.model.ts

import {CallStatus, RoomType} from "../../../core/utils/enums";

export class PushCallDataModel {
    readonly callId: string;
    readonly callerId: string;
    readonly userName: string;
    readonly roomId: string;
    readonly userImage: string;
    readonly withVideo: boolean;
    readonly roomType: RoomType;
    readonly callStatus: CallStatus;
    readonly groupName?: string;


    constructor(
        callId: string,
        userName: string,
        callerId: string,
        userImage: string,
        roomId: string,
        withVideo: boolean,
        callStatus: CallStatus,
        roomType: RoomType,
        groupName?: string,
    ) {
        this.callId = callId;
        this.userName = userName;
        this.callerId = callerId;
        this.userImage = userImage;
        this.roomId = roomId;
        this.withVideo = withVideo;
        this.callStatus = callStatus;
        this.roomType = roomType;
        this.groupName = groupName;
    }


}


