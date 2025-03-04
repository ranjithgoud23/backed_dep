/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

export enum UserType {
    Normal = "normal",
    Admin = "admin",
    SuperAdmin = "superAdmin",
}

export enum MailType {
    VerifyEmail = "verifyEmail",
    ResetPassword = "resetPassword"
}

export enum VPushProvider {
    fcm = "fcm", onesignal = "onesignal"
}
export enum ChatRequestStatus {
    Accepted = "accepted",
    Refused = "refused",
    Canceled = "canceled",
    Pending = "pending"
}
export enum UserPrivacyTypes{
    ForReq="forReq",
    Public="public",
}
export enum UserRole {
    Prime = "prime",
    Admin = "admin",
    HasBadge = "hasBadge",
}

export enum AccessTokenType {
    Access = "access",
    Refresh = "refresh",
}


export enum NotificationType {
    Admin = "admin"

}


export enum TokenType {
    Access = "access",
    Refresh = "refresh"
}

export enum S3UploaderTypes {
    profileImage = "pic100",
    chatImage = "ci500",
    chatVideo = "cv501",
    chatFile = "cf502",
    chatVoice = "cv503",
    smallImage = "si400",
    mediumImage = "mi500",
    media = "media600",
}


export enum Platform {
    Android = "android",
    Ios = "ios",
    Web = "web",
    Linux = "linux",
    Mac = "macOs",
    Windows = "windows",
    Other = "other"
}

export enum PushTopics {
    AdminAndroid = "admin-android",
    AdminIos = "ios-android",
    Verified = "verified",
    UnVerified = "unverified",
}


export enum RegisterMethod {
    email = "email",
    phone = "phone",
    facebook = "facebook",
    gmail = "gmail",
    apple = "apple",
}

export enum RegisterStatus {
    accepted = "accepted",
    pending = "pending",
    notAccepted = "notAccepted",
}
export enum StoryPrivacy {
    Public = "public",
    SomePeople = "somePeople",
}

export enum StoryTextAlign {
    Center = "center",
    Left = "left",
    Right = "right",
}
export enum StoryType {
    Text = "text",
    Voice = "voice",
    Image = "image",
    Video = "video",
    File = "file",
}

export enum StoryFontType {
    Normal = "normal",
    Italic = "italic",
    Bold = "bold",
}

export enum ProfileType {
    Private = "private",
    Hidden = "hidden",
    Public = "public",
}

export enum MessageType {
    Text = "text",
    Voice = "voice",
    Image = "image",
    Video = "video",
    File = "file",
    AllDeleted = "allDeleted",
    Location = "location",
    Custom = "custom",
    Call = "call",
    //this should not notify user about it
    Info = "info",
}

export enum RoomType {
    Single = "s",
    GroupChat = "g",
    Broadcast = "b",
    Order = "o",
}

export enum GroupRoleType {
    Member = "member",
    SuperAdmin = "superAdmin",
    Admin = "admin"
}

export enum DeleteMessageType {
    all = "all",
    me = "me"
}

export enum RoomTypingStatus {
    stop = "stop",
    typing = "typing",
    recording = "recording",

}

export enum ExceptionType {
    flutter = "flutter",
    dart = "dart",
    http = "http",
    sqlite = "sqlite",
    nestjs = "nestjs",
}


export enum SocketEventsType {
    //clint listener
    v1OnNewMessage = "v1OnNewMessage",
    v1OnBanUserChat = "v1OnBanUserChat",
    v1OnDeleteMessageFromAll = "v1OnDeleteMessageFromAll",
    v1OnKickGroupMember = "v1OnKickGroupMember",
    v1OnMyOnline = "v1OnMyOnline",
    v1OnRoomStatusChange = "v1OnRoomStatusChange",
    v1OnDeliverChatRoom = "v1OnDeliverChatRoom",
    v1OnException = "v1OnException",
    v1OnEnterChatRoom = "v1OnEnterChatRoom",
    //call events
    v1OnCallAccepted = "v1OnCallAccepted",
    v1OnCallEnded = "v1OnCallEnded",
    // v1OnCallCanceled = "v1OnCallCanceled",
    v1OnCallRejected = "v1OnCallRejected",
    // v1OnNewCall = "v1OnNewCall",
    // v1OnCallTimeout = "v1OnCallTimeout",
    v1OnIceCandidate = "v1OnIceCandidate",


    //server emitter
    v1EnterChatRoom = "v1EnterChatRoom",
    v1KickGroupMember = "v1KickGroupMember",
    v1DeliverChatRoom = "v1DeliverChatRoom",
    v1MyOnline = "v1MyOnline",
    v1RoomStatusChange = "v1RoomStatusChange",
    v1IceCandidate = "v1IceCandidate",
}


export enum NotificationType {
    GroupChat = "groupChat",
    ProjectChat = "projectChat",
    SingleChat = "singleChat",
    Call = "call",
    ChatReq = "chatReq",
    NewFollow = "newFollow",
    BroadcastChat = "broadcastChat",
    deleteMessage = "deleteMessage",
}

export enum MessageFilter {
    Media = "media",
    Links = "links",
    File = "file",
    Voice = "voice",
    All = "all",
}

export enum MessageStatusType {
    Seen = "seen",
    Deliver = "deliver"
}

export enum CallStatus {
    Ring = "ring",
    Canceled = "canceled",
    Timeout = "timeout",
    Offline = "offline",
    Rejected = "rejected",
    Finished = "finished",
    ServerRestart = "serverRestart",
    InCall = "inCall",
}
export enum MeetPlatform {
    WebRtc = "webRtc", Agora = "agora"
}

export enum PaginateType {
    Page = "page",
    id = "id"
}

export enum SortType {
    Asc = "asc",
    Desc = "desc"
}

export enum MessageInfoType {
    UpdateTitle = "updateTitle",
    UpdateImage = "updateImage",
    AddGroupMember = "addGroupMember",

    UpAdmin = "upAdmin",
    DownMember = "downMember",
    Leave = "leave",
    Kick = "kick",
    CreateGroup = "createGroup",

    AddToBroadcast = "addToBroadcast",
}