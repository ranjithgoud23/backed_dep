/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFiles, Query, BadRequestException
} from '@nestjs/common';
import {UserStoryService} from './user_story.service';
import {VerifiedAuthGuard} from "../../../core/guards/verified.auth.guard";
import {V1Controller} from "../../../core/common/v1-controller.decorator";
import {resOK} from "../../../core/utils/res.helpers";
import {CreateStoryDto} from "./dto/story.dto";
import {FilesInterceptor} from "@nestjs/platform-express";
import {MongoIdDto} from "../../../core/common/dto/mongo.id.dto";
import {isValidMongoId} from "../../../core/utils/utils";
import {jsonDecoder} from "../../../core/utils/app.validator";


@UseGuards(VerifiedAuthGuard)
@V1Controller('user-story')
export class UserStoryController {

    constructor(private readonly userStoryService: UserStoryService) {
    }


    @UseInterceptors(
        FilesInterceptor('file', 4, {
            limits: {
                files: 4,
                fields: 400,
                fieldSize: 400000000000,
                fieldNameSize: 400000000000,
            },
        }),
    )
    @Post()
    async create(
        @Body() dto: CreateStoryDto,
        @Req() req: any,
        @UploadedFiles() file?: Express.Multer.File[],
    ) {
        dto.myUser = req.user
        if (!dto.isText()) {
            dto._mediaFile = file[0];
            dto._secondMediaFile = file[1] ?? undefined;
        }
        if (dto.somePeople) {
            try {
                dto.somePeople = jsonDecoder(dto.somePeople);
            } catch (e) {
            }
            for (let id of dto.somePeople) {
                let isValid = isValidMongoId(id);
                if (!isValid) {
                    throw new BadRequestException("id " + id + " not valid mongodb id");
                }
            }
        } else {
            dto.somePeople = [];
        }
        if (dto.exceptPeople) {
            try {
                dto.exceptPeople = jsonDecoder(dto.exceptPeople);
            } catch (e) {
            }
            for (let id of dto.exceptPeople) {
                let isValid = isValidMongoId(id);
                if (!isValid) {
                    throw new BadRequestException("id " + id + " not valid mongodb id");
                }
            }
        } else {
            dto.somePeople = [];
        }
        return resOK(await this.userStoryService.create(dto));
    }

    @Get("/")
    async findAll(@Req() req: any, @Query() dto: object) {
        return resOK(await this.userStoryService.findAll(req.user._id, dto));
    }

    @Get("/me")
    async myStories(@Req() req: any) {
        return resOK(await this.userStoryService.myStories(req.user._id));
    }
    @Delete("/:id")
    async delete(@Param() dto: MongoIdDto, @Req() req: any) {
        dto.myUser = req.user
        return resOK(await this.userStoryService.remove(dto));
    }



    @Post("/views/:id")
    async addView(@Param() dto: MongoIdDto, @Req() req: any) {
        dto.myUser = req.user
        return resOK(await this.userStoryService.addView(dto));
    }

    @Get("/views/:id")
    async getView(@Param() dto: MongoIdDto, @Req() req: any, @Query() queryData: object) {
        dto.myUser = req.user
        return resOK(await this.userStoryService.getView(dto, queryData));
    }
}
