/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import {MongooseModule} from "@nestjs/mongoose";
import {StorySchema} from "./entities/story.entity";

@Module({
  providers: [StoryService],
  exports: [StoryService],
  imports:[
    MongooseModule.forFeature([{
      name: "story",
      schema: StorySchema
    }]),
  ]
})
export class StoryModule {}
