import { Module } from '@nestjs/common';
import { ChatRequestService } from './chat_request.service';
import {MongooseModule} from "@nestjs/mongoose";
import {StorySchema} from "../../api/stories/story/entities/story.entity";
import {ChatRequestSchema} from "./entities/chat.request.entity";

@Module({
  providers: [ChatRequestService],
  exports: [ChatRequestService],
  imports:[
    MongooseModule.forFeature([{
      name: "chat_request",
      schema: ChatRequestSchema
    }]),
  ]
})
export class ChatRequestModule {}
