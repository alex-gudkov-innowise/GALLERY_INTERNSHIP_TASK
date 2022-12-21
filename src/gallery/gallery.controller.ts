import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { GalleryService } from './gallery.service';
import { PostContentDTO } from './dto/post-content.dto';
import { Res } from '@nestjs/common/decorators';
// import { Request } from 'express';

@Controller('gallery')
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
};
