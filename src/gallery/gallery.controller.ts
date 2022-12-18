import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { GalleryService } from './gallery.service';
import { PostContentDTO } from './dto/post-content.dto';

@Controller('gallery')
export class GalleryController
{
    constructor(private readonly galleryService: GalleryService) {}

    @UseGuards(AuthGuard)
    @Get()
    GetMyContent()
    {
        return this.galleryService.GetMyContent();
    }
    
    @UseGuards(AuthGuard)
    @Get(':id')
    GetUserContent(@Param('id') userId: number)
    {
        return this.galleryService.GetUserContent(userId);
    }

    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('contentFile')) // string that specifies the field name from the form that holds a file
    PostMyContent(
        @Body() dto: PostContentDTO,
        @UploadedFile() contentFile: Express.Multer.File
    )
    {
        console.log(contentFile);
        
        return this.galleryService.PostMyContent(dto, contentFile);
    }
};
