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
    @Patch(':contentId/edit')
    EditContent(
        @Body() dto: EditContentDTO,
        @Param('contentId') contentId: number,
        @Req() request: any,
    )
    {
        const userId: number = request.user.id;

        return this.contentService.EditContent(contentId, userId, dto);
    }

    @UseGuards(AuthGuard)
    @Delete(':contentId/remove')
    RemoveContent(
        @Req() request: any,
        @Param('contentId') contentId: number,
    )
    {
        const userId: number = request.user.id;

        return this.contentService.RemoveContent(contentId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('create')
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    CreateContent(
        @Body() dto: CreateContentDTO,
        @UploadedFile() contentFile: Express.Multer.File,
        @Req() request: any,
    )
    {
        const userId: number = request.user.id;

        return this.contentService.CreateContent(contentFile, userId, dto);
    }

    @Get('video/:fileName')
    LoadVideo(
        @Param('fileName') fileName: string,
        @Req() request: any,
        @Res() response: any,
    )
    {
        return this.contentService.LoadVideo(fileName, request, response);
    }
};
