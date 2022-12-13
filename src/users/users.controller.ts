import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDTO } from './DTO/CreateUser.DTO';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
    constructor(private userService: UsersService) {}

    @Post()
    Create(@Body() dto: CreateUserDTO)
    {
        return this.userService.CreateUser(dto);
    }

    @Get()
    GetAll()
    {
        return this.userService.GetAllUsers();
    }
};
