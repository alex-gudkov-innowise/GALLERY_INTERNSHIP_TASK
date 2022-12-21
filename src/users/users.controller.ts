import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContentService } from 'src/content/content.service';

@Controller('users')
export class UsersController
{
    constructor(
        private readonly usersService: UsersService,
        private readonly contentService: ContentService,
    ) {}

    @UseGuards(AuthGuard)
    @Get(':id/images')
    GetUserImages(
        @Param('id') id: number,
        @Req() req: any,
    )
    {
        const myId = req.user.id;

        return this.contentService.GetUserImages(id);
    }

    @UseGuards(AuthGuard)
    @Get(':id/videos')
    GetUserVideos(
        @Param('id') id: number,
        @Req() req: any,
    )
    {
        const myId = req.user.id;
        console.log(myId);
        
        return this.contentService.GetUserVideos(id);
    }

    @UseGuards(AuthGuard)
    @Get()
    GetAllUsers()
    {
        return this.usersService.GetAllUsers();
    }
    
    @UseGuards(AuthGuard)
    @Get(':id')
    GetUserById(@Param('id') id: number)
    {
        return this.usersService.GetUserById(id);
    }
};
