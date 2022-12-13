import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDTO } from './DTO/CreateUser.DTO';
import { User } from './users.model';

@Injectable()
export class UsersService
{
    constructor(@InjectModel(User) private userRepository: typeof User) {}

    async CreateUser(dto: CreateUserDTO)
    {
        const user = await this.userRepository.create(dto);
        return user;
    }
    async GetAllUsers()
    {
        const allUsers = await this.userRepository.findAll();
        return allUsers;
    }
};
