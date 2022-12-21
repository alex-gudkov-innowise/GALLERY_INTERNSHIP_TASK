import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { PostContentDTO } from '../content/dto/post-content.dto';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController
{
    constructor(
        private readonly contentService: ContentService,
    ) {}

    @UseGuards(AuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    PostMyContent(
        @Body() dto: PostContentDTO,
        @UploadedFile() contentFile: Express.Multer.File,
        @Req() request: any,
    )
    {
        const myId = request.user.id;

        return this.contentService.PostMyContent(myId, dto, contentFile);
    }

    @Get('video/:fileName')
    LoadVideoStream(
        @Param('fileName') fileName: string,
        @Req() request: any,
        @Res() response: any,
    )
    {
        return this.contentService.LoadVideoStream(fileName, request, response);
    }
};
