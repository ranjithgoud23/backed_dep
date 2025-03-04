/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {UserModule} from "./api/user_modules/user/user.module";
import {InjectConnection, MongooseModule} from "@nestjs/mongoose";
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {UserDeviceModule} from "./api/user_modules/user_device/user_device.module";
import path, {join} from "path";
import root from "app-root-path";
import {APP_FILTER, APP_GUARD} from "@nestjs/core";
import {AllExceptionFilter} from "./core/exception_filter/all-exception.filter";
import {CountriesModule} from "./api/countries/countries.module";
import {UserCountryModule} from "./api/user_modules/user_country/user_country.module";
import {VersionsModule} from "./api/versions/versions.module";
import {AppConfigModule} from "./api/app_config/app_config.module";
import {AuthModule} from "./api/auth/auth.module";
import {FileUploaderModule} from "./common/file_uploader/file_uploader.module";
import {Connection} from "mongoose";
import fs from "fs";
import {ICountry} from "./api/countries/countries.entity";
import {IAppConfig} from "./api/app_config/entities/app_config.entity";
import {ProfileModule} from "./api/profile/profile.module";
import {UserBanModule} from "./api/user_modules/user_ban/user_ban.module";
import {BanModule} from "./api/ban/ban.module";
import {UserVersionModule} from "./api/user_modules/user_version/user_version.module";
import {AdminNotificationModule} from "./api/admin_notification/admin_notification.module";
import {AdminPanelModule} from "./api/admin_panel/admin_panel.module";
import {ReportSystemModule} from "./api/report_system/report_system.module";
import {NotificationEmitterModule} from "./common/notification_emitter/notification_emitter.module";
import {SocketIoModule} from './chat/socket_io/socket_io.module';
import {GroupMessageStatusModule} from './chat/group_message_status/group_message_status.module';
import {MessageModule} from './chat/message/message.module';
import {GroupSettingsModule} from './chat/group_settings/group_settings.module';
import {GroupMemberModule} from './chat/group_member/group_member.module';
import {BroadcastSettingsModule} from './chat/broadcast_settings/broadcast_settings.module';
import {BroadcastMemberModule} from './chat/broadcast_member/broadcast_member.module';
import {OrderRoomSettingsModule} from './chat/order_room_settings/order_room_settings.module';
import {SingleRoomSettingsModule} from './chat/single_room_settings/single_room_settings.module';
import {RoomMemberModule} from './chat/room_member/room_member.module';
import {RoomMiddlewareModule} from './chat/room_middleware/room_middleware.module';

import {ChannelModule} from './chat/channel/channel.module';
import {CallMemberModule} from "./chat/call_modules/call_member/call_member.module";
import {CallModule} from "./chat/call_modules/call/call.module";
import {ScheduleModule} from "@nestjs/schedule";
import {MailEmitterModule} from "./api/mail/mail.emitter.module";
import {AgoraModule} from './chat/agora/agora.module';
import {StoryModule} from './api/stories/story/story.module';
import {UserStoryModule} from './api/stories/user_story/user_story.module';
import {IUser} from "./api/user_modules/user/entities/user.entity";
import {DbMigrateModule} from './common/db/db_migrate/db_migrate.module';
import {version} from '../package.json';
import {FirstRunModule} from './common/db/first_run/first_run.module';
import { ChatRequestModule } from './chat/chat_request/chat_request.module';
import {StoryAttachmentModule} from "./api/stories/story_attachment/story_attachment.module";
import {CallHistoryModule} from "./chat/call_modules/call_history/call_history.module";

@Module({
    imports: [
        UserModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: process.env.ignoreEnvFile == "true",
            envFilePath: path.join(root.path, ".env." + process.env.NODE_ENV)
        }),
        ThrottlerModule.forRoot({
            ttl: 60 * 5, // 5 minutes
            limit: 800,
            ignoreUserAgents: [/googlebot/gi, /bingbot/gi, /baidubot/gi]
        }),
        // MongooseModule.forRootAsync({
        //     inject: [ConfigService],
        //     useFactory: async (conf: ConfigService) => {
        //         return {
        //             uri: conf.getOrThrow<string>("DB_URL")
        //         };
        //     }
        // }),
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
              uri: configService.get<string>('DB_URL'),
              connectionFactory: (connection) => {
                connection.on('error', (error) => {
                  console.error('Mongoose connection error:', error);
                });
                connection.on('connected', () => {
                  console.log('Mongoose connected successfully');
                });
                return connection;
              },
            }),
            inject: [ConfigService],
          }),
        UserDeviceModule,
        CountriesModule,
        UserCountryModule,
        MailEmitterModule,
        VersionsModule,
        AppConfigModule,
        AuthModule,
        FileUploaderModule,
        ProfileModule,
        UserBanModule,
        BanModule,
        UserVersionModule,
        AdminNotificationModule,
        AdminPanelModule,
        ReportSystemModule,
        NotificationEmitterModule,
        SocketIoModule,
        GroupMessageStatusModule,
        MessageModule,
        GroupSettingsModule,
        GroupMemberModule,
        BroadcastSettingsModule,
        BroadcastMemberModule,
        OrderRoomSettingsModule,
        SingleRoomSettingsModule,
        RoomMemberModule,
        RoomMiddlewareModule,
        CallMemberModule,
        CallModule,
        ChannelModule,
        AgoraModule,
        StoryModule,
        UserStoryModule,
        FirstRunModule,
        DbMigrateModule,
        ChatRequestModule,
        StoryAttachmentModule,
        CallHistoryModule,

    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionFilter
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ]
})
export class AppModule {
}
