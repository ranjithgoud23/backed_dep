import {Module} from '@nestjs/common';
import {StoryAttachmentService} from './story_attachment.service';
import {MongooseModule} from "@nestjs/mongoose";
import {StoryAttachment} from "./entities/story_attachment.entity";

@Module({
    providers: [StoryAttachmentService],
    exports: [StoryAttachmentService],
    imports:[
        MongooseModule.forFeature([{
            name: "story_attachment",
            schema: StoryAttachment
        }]),
    ]
})
export class StoryAttachmentModule {
}
