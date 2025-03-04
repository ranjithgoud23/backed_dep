/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {BadRequestException, ForbiddenException, Injectable} from '@nestjs/common';
import {StoryService} from "../story/story.service";
import {CreateStoryDto} from "./dto/story.dto";
import {resOK} from "../../../core/utils/res.helpers";
import {MongoIdDto} from "../../../core/common/dto/mongo.id.dto";
import {CreateS3UploaderDto} from "../../../common/file_uploader/create-s3_uploader.dto";
import {FileUploaderService} from "../../../common/file_uploader/file_uploader.service";
import {jsonDecoder} from "../../../core/utils/app.validator";
import {newMongoObjId} from "../../../core/utils/utils";
import {BanService} from "../../ban/ban.service";
import {UserBanService} from "../../user_modules/user_ban/user_ban.service";
import {PaginationParameters} from "mongoose-paginate-v2";
import {UserService} from "../../user_modules/user/user.service";
import {StoryPrivacy, UserPrivacyTypes} from "../../../core/utils/enums";
import {IUser} from "../../user_modules/user/entities/user.entity";
import {StoryAttachmentService} from "../story_attachment/story_attachment.service";

@Injectable()
export class UserStoryService {

    constructor(
        private readonly storyService: StoryService,
        private readonly s3: FileUploaderService,
        private readonly userBanService: UserBanService,
        private readonly userService: UserService,
        private readonly storyAttachmentService: StoryAttachmentService,
    ) {
    }

    async create(dto: CreateStoryDto) {
        let exceptPeople = [];

        if (!dto.isText() && !dto._mediaFile)
            throw new BadRequestException("file data required");
        if (dto._mediaFile) {
            let thumbFile = null
            let mainFileKey = await this._uploadFile(dto._mediaFile, dto.myUser);
            if (dto._secondMediaFile) {
                thumbFile = await this._uploadFile(dto._secondMediaFile, dto.myUser);
            }
            dto.att = {
                ...jsonDecoder(dto.attachment),
                fileSize: dto._mediaFile.size,
                mimeType: dto._mediaFile.mimetype,
                name: dto._mediaFile.originalname,
                url: mainFileKey,
                thumbUrl: thumbFile
            };
        }
        exceptPeople = await this.userBanService.getMyBlockTheyAndMe(dto.myUser._id)
        exceptPeople.push(dto.myUser._id)
        dto.somePeople.push(
            ...(await this.userService.findAll({
                _id: {$nin: exceptPeople},
            }))
        );

        let story = await this.storyService.create(dto.toJson());
        delete story['somePeople']
        let att = await this.storyAttachmentService.create({
            storyId: story ["_id"],
            likes: [],
            reply: [],
            shares: [],
        });
        return {
            ...story,
            storyAttachment: {
                ...att,
                likes: 0,
                reply: 0,
                shares: 0,
            },
        };
    }

    async getMyStories(myId: string) {
        let myStories = await this.storyService.findAll({
            expireAt: {$gte: new Date()},
            userId: myId
        })
    }


    async findAll(myId: string, dto: object) {
        let blocked = [];
        let myIdObj = newMongoObjId(myId);
        blocked.push(myIdObj);
        let paginationParameters = new PaginationParameters({
            query: {
                limit: 30,
                page: 1,
                sort: "-_id",
                ...dto,
            },
        }).get();
        return this.storyService.aggregateV2(
            this.storyStages(myIdObj, {
                expireAt: {$gte: new Date()},
                userId: {$nin: blocked},
                somePeople: myIdObj,
            }),
            paginationParameters[1].page,
            paginationParameters[1].limit
        );
    }

    private storyStages(myIdObj: any, match: {}) {
        return [
            {
                $match: match
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $group: {
                    _id: "$userId",
                    stories: {$push: "$$ROOT"}
                }
            },
            {
                $sort: {
                    'stories._id': -1
                }
            },

            {
                $addFields: {
                    stories: {
                        $map: {
                            input: "$stories",
                            as: "story",
                            in: {
                                _id: "$$story._id",
                                userId: "$$story.userId",
                                content: "$$story.content",
                                backgroundColor: "$$story.backgroundColor",
                                caption: "$$story.caption",
                                storyType: "$$story.storyType",
                                att: "$$story.att",
                                fontType: "$$story.fontType",
                                expireAt: "$$story.expireAt",
                                createdAt: "$$story.createdAt",
                                updatedAt: "$$story.updatedAt",
                                viewedByMe: {
                                    $in: [myIdObj, "$$story.views.viewerId"]
                                }
                            }
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $project: {
                    _id: 0,
                    stories: 1,
                    userData: {$arrayElemAt: ["$userData", 0]}
                }
            },
            {
                $project: {
                    stories: 1,
                    userData: {
                        fullName: 1,
                        _id: 1,
                        userImage: 1
                    }
                }
            }
        ];
    }

    async remove(dto: MongoIdDto) {
        let story = await this.storyService.findByIdOrThrow(dto.id);
        if (story.userId != dto.myUser._id)
            throw new ForbiddenException(
                "You dont have access to delete story not belong to you"
            );
        await this.storyService.findByIdAndDelete(dto.id);
        return "Deleted";
    }

    async addView(dto: MongoIdDto) {
        await this.storyService.findOneAndUpdate(
            {
                _id: dto.id,
                "views.viewerId": {$ne: newMongoObjId(dto.myUser._id)},
                userId: {$ne: dto.myUser._id},
            },
            {
                $addToSet: {
                    views: {
                        viewerId: newMongoObjId(dto.myUser._id),
                        viewedAt: new Date(),
                    },
                },
            },
            null
        );
        return "added";
    }

    async getView(dto: MongoIdDto, query: object) {
        let story = await this.storyService.findByIdOrThrow(dto.id);
        if (story.userId != dto.myUser._id)
            throw new BadRequestException("This not your story!");
        let storyId = newMongoObjId(dto.id);

        let page = 1;
        let limit = 30;
        if (query["page"]) {
            page = query["page"];
        }

        if (query["limit"]) {
            limit = query["limit"];
        }
        let skip = (page - 1) * limit;

        return this.storyService.aggregate([
            {
                $match: {
                    _id: storyId, // Match the specific story
                },
            },
            {
                $unwind: "$views", // Deconstruct the views array
            },
            {
                $skip: skip, // Skip documents for pagination
            },
            {
                $limit: limit, // Limit the number of documents for pagination
            },
            {
                $lookup: {
                    from: "users",
                    localField: "views.viewerId",
                    foreignField: "_id",
                    as: "views.viewerInfo",
                },
            },

            {
                $unwind: "$views.viewerInfo", // Unwind the populated viewerInfo
            },
            {
                $group: {
                    // Group back the views
                    _id: "$_id",
                    views: {
                        $push: {
                            viewerId: "$views.viewerId",
                            viewedAt: "$views.viewedAt",
                            viewerInfo: "$views.viewerInfo",
                        },
                    },
                },
            },
            {
                $project: {
                    "views.viewerInfo._id": 1,
                    "views.viewedAt": 1,
                    "views.viewerInfo.fullName": 1,
                    "views.viewerInfo.bio": 1,
                    "views.viewerInfo.userImages": 1,
                },
            },
        ]);
    }

    async myStories(myId: string) {
        let myIdObj = newMongoObjId(myId);
        let paginationParameters = new PaginationParameters({
            query: {
                limit: 30,
                page: 1,
                sort: "-_id",
            },
        }).get();
        return await this.storyService.aggregateV2(
            this.storyStages(myIdObj, {
                expireAt: {$gte: new Date()},
                userId: myIdObj,
            }),
            paginationParameters[1].page,
            paginationParameters[1].limit
        );
    }

    private async _uploadFile(
        _mediaFile: Express.Multer.File,
        myUser: IUser
    ) {
        let uploaderDto = new CreateS3UploaderDto();
        uploaderDto.mediaBuffer = _mediaFile.buffer;
        uploaderDto.myUser = myUser;
        uploaderDto.fileName = _mediaFile.originalname;
        return await this.s3.uploadChatMedia(uploaderDto);
    }
}
