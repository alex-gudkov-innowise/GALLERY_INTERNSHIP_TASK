import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContentService } from './content.service';
import { EditContentDTO } from './dto/edit-content.dto';
import { CreateContentDTO } from './dto/create-content.dto';

@Controller('content')
export class ContentController
{
    constructor(
        private readonly contentService: ContentService,
    ) {}

    @UseGuards(AuthGuard)
    @Delete(':contentId/remove')
    RemoveContent(@Req() request: any, @Param('contentId') contentId: number)
    {
        const myUserId: number = request.user.id;

        return this.contentService.RemoveContent(contentId, myUserId);
    }

    @UseGuards(AuthGuard)
    @Patch(':contentId/close/:userId') // close a specific image/video for a specific user
    CloseSpecificContentForSpecificUser(
        @Req() request: any,
        @Param('contentId') contentId: number,
        @Param('userId') userId: number
    ){
        const myUserId: number = request.user.id; // used to check that content belongs to my user 

        return this.contentService.CloseSpecificContentForSpecificUser(contentId, myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Patch('close/:userId') // close all images/videos for a specific user
    CloseAllContentForSpecificUser(
        @Req() request: any,
        @Param('userId') userId: number
    ){
        const myUserId: number = request.user.id;

        return this.contentService.CloseAllContentForSpecificUser(myUserId, userId);
    }
    
    @UseGuards(AuthGuard)
    @Patch('close') // close all images/videos for all users
    CloseAllContentForAllUsers(
        @Req() request: any
    ){
        const myUserId: number = request.user.id;

        return this.contentService.CloseAllContentForAllUsers(myUserId);
    }

    @UseGuards(AuthGuard)
    @Post('create')
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    CreateContent(@Body() dto: CreateContentDTO, @UploadedFile() contentFile: Express.Multer.File, @Req() request: any)
    {
        const myUserId: number = request.user.id;

        return this.contentService.CreateContent(contentFile, myUserId, dto);
    }

    @Get('video/:fileName')
    LoadVideo(@Param('fileName') fileName: string, @Req() request: any, @Res() response: any)
    {
        return this.contentService.LoadVideo(fileName, request, response);
    }
};
