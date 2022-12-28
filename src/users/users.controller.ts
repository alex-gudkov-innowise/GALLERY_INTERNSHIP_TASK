import { Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContentService } from 'src/content/content.service';

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly contentService: ContentService
    ) {}

    @Get('/:id/images')
    getUserImages(
        @Param('id') id: number,
        @Req() request: any
    ) {
        const myUserId = request.userId;
    
        return this.contentService.getUserImages(id, myUserId);
    }

    @Get('/:id/videos')
    getUserVideos(
        @Param('id') id: number,
        @Req() request: any
    ) {
        const myUserId = request.userId;
    
        return this.contentService.getUserVideos(id, myUserId);
    }

    @Get('/')
    getUser(
        @Query('id') id: number,
        @Query('email') email: string, @Query('name') name: string
    ) {
        return this.usersService.getUser(id, email, name);
    }

    @Patch('/:userId/close') // close user gallery for all users
    closeUserGallery(
        @Param('userId') userId: number,
        @Req() request: any
    ) {
        const myUserId: number = request.userId;

        return this.usersService.closeUserGallery(userId, myUserId);
    }
}
