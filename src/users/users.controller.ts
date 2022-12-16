import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
    constructor(
        private readonly userService: UsersService
    ) {}

    @Post()
    Create(@Body() dto: CreateUserDTO)
    {
        return this.userService.CreateUser(dto);
    }

    @Put(':id')
    Update(@Param('id') id: number, @Body() dto: CreateUserDTO)
    {
        return this.userService.UpdateUserById(id, dto);
    }

    @Get()
    GetAll()
    {
        return this.userService.GetAllUsers();
    }
    
    @Get(':id')
    GetById(@Param('id') id: number)
    {
        return this.userService.GetUserById(id);
    }

    @Delete(':id')
    Delete(@Param('id') id: number)
    {
        return this.userService.DeleteUserById(id);
    }
};
