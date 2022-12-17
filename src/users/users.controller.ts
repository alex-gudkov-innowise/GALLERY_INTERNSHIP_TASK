import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController
{
    constructor(private readonly userService: UsersService) {}

    @UseGuards(AuthGuard)
    @Get()
    GetAll()
    {
        return this.userService.GetAllUsers();
    }
    
    @UseGuards(AuthGuard)
    @Get(':id')
    GetById(@Param('id') id: number)
    {
        return this.userService.GetUserById(id);
    }
};
