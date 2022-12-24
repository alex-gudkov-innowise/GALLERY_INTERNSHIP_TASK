import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContentService } from './content.service';
import { CreateContentDTO } from './dto/create-content.dto';
import { EditContentDTO } from './dto/edit-content.dto';

@Controller('content')
export class ContentController
{
    constructor(
        private readonly contentService: ContentService,
    ) {}

    @UseGuards(AuthGuard)
    @Delete(':contentId/remove')
    RemoveContent(
        @Req() request: any,
        @Param('contentId') contentId: number
    ){
        const myUserId: number = request.user.id;

        return this.contentService.RemoveContent(contentId, myUserId);
    }

    @UseGuards(AuthGuard)
    @Post(':contentId/close/:userId') // close a specific image/video for a specific user
    CloseOneContentForOneUser(
        @Req() request: any,
        @Param('contentId') contentId: number,
        @Param('userId') userId: number
    ){
        const myUserId: number = request.user.id; // used to check that content belongs to my user 

        return this.contentService.CloseOneContentForOneUser(contentId, myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Post(':contentId/open/:userId') // open a specific image/video for a specific user
    OpenOneContentForOneUser(
        @Req() request: any,
        @Param('contentId') contentId: number,
        @Param('userId') userId: number
    ){
        const myUserId: number = request.user.id;

        return this.contentService.OpenOneContentForOneUser(contentId, myUserId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('close/:userId') // close all my images/videos for a specific user
    CloseAllMyContentForOneUser(
        @Req() request: any,
        @Param('userId') userId: number
    ){
        const myUserId: number = request.user.id;

        return this.contentService.CloseAllMyContentForOneUser(myUserId, userId);
    }
    
    @UseGuards(AuthGuard)
    @Post('create')
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    CreateContent(
        @Body() dto: CreateContentDTO,
        @UploadedFile() contentFile: Express.Multer.File, 
        @Req() request: any
    ){
        const myUserId: number = request.user.id;

        return this.contentService.CreateContent(contentFile, myUserId, dto);
    }

    @UseGuards(AuthGuard)
    @Put(':contentId/edit')
    @UseInterceptors(FileInterceptor('contentFile'))
    EditContent(
        @Param('contentId') contentId: number,
        @UploadedFile() contentFile: Express.Multer.File,
        @Body() dto: EditContentDTO,
        @Req() request: any
    ){
        const myUserId: number = request.user.id;

        return this.contentService.EditContent(contentId, contentFile, dto, myUserId);
    }

    @Get('video/:fileName')
    LoadVideo(
        @Param('fileName') fileName: string,
        @Req() request: any,
        @Res() response: any
    ){
        return this.contentService.LoadVideo(fileName, request, response);
    }
};
