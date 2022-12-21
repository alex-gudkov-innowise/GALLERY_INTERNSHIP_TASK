import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { GalleryService } from './gallery.service';
import { PostContentDTO } from './dto/post-content.dto';
// import { Request } from 'express';

@Controller('content')
export class GalleryController
{
    constructor(private readonly galleryService: GalleryService) {}

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

        return this.galleryService.PostMyContent(myId, dto, contentFile);
    }

    @Get('video/:fileName')
    LoadVideoStream(
        @Param('fileName') fileName: string,
        @Req() request: any,
        @Res() response: any,
    )
    {
        return this.galleryService.LoadVideoStream(fileName, request, response);
    }
};
