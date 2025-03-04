// user-global-call-status.model.ts

export class UserGlobalCallStatus {
     readonly isCaller : boolean;
     readonly callId?: string;
     readonly callerId?: string;
     readonly roomId?: string;
     readonly createdAt?: Date;

    constructor(
        isCaller = false,
        callId = null,
        callerId = null,
        roomId = null,
        createdAt = null,
    ) {
        this.isCaller = isCaller;
        this.callId = callId;
        this.roomId = roomId;
        this.callerId = callerId;
        this.createdAt = createdAt;
    }


    // Factory method
    public static createEmpty(): UserGlobalCallStatus {
        return new UserGlobalCallStatus();
    }



    // To plain object method
    public toJSON() {
        return {
            isCaller: this.isCaller,
            callId: this.callId,
            callerId: this.callerId,
            roomId: this.roomId,
            createdAt: this.createdAt,
        };
    }
}


