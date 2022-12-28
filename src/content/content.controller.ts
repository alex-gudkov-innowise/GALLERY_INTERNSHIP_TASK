import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { EditContentDto } from './dto/edit-content.dto';

@Controller('/content')
export class ContentController {
    constructor(private readonly contentService: ContentService) {}

    @UseGuards(AuthGuard)
    @Delete('/:contentId/remove')
    removeContent(
        @Req() request: any,
        @Param('contentId') contentId: number
    ) {
        const myUserId: number = request.userId;

        return this.contentService.removeContent(contentId, myUserId);
    }

    @UseGuards(AuthGuard)
    @Post('/:contentId/close/:userId') // close a specific image/video for a specific user
    closeOneContentForOneUser(
        @Req() request: any,
        @Param('contentId') contentId: number,
        @Param('userId') userId: number,
    ) {
        const myUserId: number = request.userId; // used to check that content belongs to my user

        return this.contentService.closeOneContentForOneUser(contentId, myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('/:contentId/open/:userId') // open a specific image/video for a specific user
    openOneContentForOneUser(
        @Req() request: any,
        @Param('contentId') contentId: number,
        @Param('userId') userId: number,
    ) {
        const myUserId: number = request.userId;

        return this.contentService.openOneContentForOneUser(contentId, myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('/close/:userId') // close all my images/videos for a specific user
    closeAllMyContentForOneUser(
        @Req() request: any,
        @Param('userId') userId: number
    ) {
        const myUserId: number = request.userId;

        return this.contentService.closeAllMyContentForOneUser(myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('/create')
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    createContent(
        @Body() dto: CreateContentDto,
        @UploadedFile() contentFile: Express.Multer.File,
        @Req() request: any,
    ) {
        const myUserId: number = request.userId;

        return this.contentService.createContent(contentFile, myUserId, dto);
    }

    @UseGuards(AuthGuard)
    @Put('/:contentId/edit')
    @UseInterceptors(FileInterceptor('contentFile'))
    editContent(
        @Param('contentId') contentId: number,
        @UploadedFile() contentFile: Express.Multer.File,
        @Body() dto: EditContentDto,
        @Req() request: any,
    ) {
        const myUserId: number = request.userId;

        return this.contentService.editContent(contentId, contentFile, dto, myUserId);
    }

    @Get('/video/:fileName')
    loadVideo(
        @Param('fileName') fileName: string,
        @Req() request: any,
        @Res() response: any
    ) {
        return this.contentService.loadVideo(fileName, request, response);
    }
}
