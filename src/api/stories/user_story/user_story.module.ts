/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import { Module } from '@nestjs/common';
import { UserStoryService } from './user_story.service';
import { UserStoryController } from './user_story.controller';
import {StoryModule} from "../story/story.module";
import {AuthModule} from "../../auth/auth.module";
import {UserModule} from "../../user_modules/user/user.module";
import {FileUploaderModule} from "../../../common/file_uploader/file_uploader.module";
import {BanModule} from "../../ban/ban.module";
import {UserBanModule} from "../../user_modules/user_ban/user_ban.module";
import {StoryAttachmentModule} from "../story_attachment/story_attachment.module";

@Module({
  controllers: [UserStoryController],
  providers: [UserStoryService],
  imports:[
      StoryModule,
      AuthModule,
      UserModule,
      FileUploaderModule,
      BanModule,
      UserBanModule,
      StoryAttachmentModule
  ]
})
export class UserStoryModule {}
