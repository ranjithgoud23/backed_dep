/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {Allow, IsEnum, IsJSON, IsNotEmpty, ValidateIf} from "class-validator";
import {MessageType, StoryFontType, StoryPrivacy, StoryTextAlign, StoryType} from "../../../../core/utils/enums";
import CommonDto from "../../../../core/common/dto/common.dto";
import {IStory} from "../../story/entities/story.entity";
import * as Buffer from "buffer";

export class CreateStoryDto extends CommonDto {

    @IsEnum(StoryType)
    storyType: StoryType


    @IsEnum(StoryPrivacy)
    @Allow()
    @ValidateIf(object => object["storyPrivacy"])
    storyPrivacy?: StoryPrivacy


    @IsNotEmpty()
    @Allow()
    @ValidateIf(object => object["storyPrivacy"] == StoryPrivacy.SomePeople)
    somePeople?: any ;


    @IsNotEmpty()
    content: string

    @Allow()
    @ValidateIf(attachmentValidationStory)
    @IsJSON()
    attachment?: string

    att?: object

    @Allow()
    backgroundColor?: string


    @Allow()
    textColor?: string

    @Allow()
    @IsEnum(StoryTextAlign)
    @ValidateIf(object => object["textAlign"])
    textAlign?: StoryTextAlign



    @Allow()
    caption?: string

    @IsEnum(StoryFontType)
    @ValidateIf(object => object["storyType"] == StoryType.Text)
    fontType?: StoryFontType

    _mediaFile?: Express.Multer.File;
    _secondMediaFile?: Express.Multer.File;

    @Allow()
    exceptPeople?: any;

    toJson() {
        return <Partial<IStory>>{
            storyType: this.storyType,
            caption: this.caption,
            textAlign: this.textAlign,
            textColor: this.textColor,
            backgroundColor: this.backgroundColor,
            att: this.att,
            userId: this.myUser._id,
            fontType: this.fontType,
            content: this.content,
            somePeople: this.somePeople,
            storyPrivacy: this.storyPrivacy,
            expireAt: this.getExpireAt(),
        }
    }

    private getExpireAt() {
        let currentDate = new Date();
        return new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Adds 24 hours to the current date
    }

    isImage() {
        if (this.storyType == StoryType.Image) {
            return true
        }
    }

    isVideo() {
        if (this.storyType == StoryType.Video) {
            return true
        }
    }

    isText() {
        if (this.storyType == StoryType.Text) {
            return true
        }
    }

    isVoice() {
        if (this.storyType == StoryType.Voice) {
            return true
        }
    }

}

function attachmentValidationStory(object) {
    let mT = object["storyType"] as String
    return mT != StoryType.Text
}