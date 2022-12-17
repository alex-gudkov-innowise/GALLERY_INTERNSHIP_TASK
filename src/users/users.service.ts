import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService
{
    constructor(
        @InjectRepository(UsersEntity) private readonly UsersRepository: Repository<UsersEntity>,
    ) {}

    async GetAllUsers(): Promise<UsersEntity[]>
    {
        const allUsers = await this.UsersRepository.find();
        return allUsers;
    }

    async GetUserById(id: number): Promise<UsersEntity>
    {
        const user = await this.UsersRepository.findOneBy({ id: id });
        return user;
    }

    async GetUserByEmail(email: string): Promise<UsersEntity>
    {
        const user = await this.UsersRepository.findOneBy({ email: email });
        return user;
    }

    async DeleteUserById(id: number): Promise<{ id: number }>
    {
        await this.UsersRepository.delete({ id: id });
        return { id: id };
    }

    async UpdateUserById(id: number, dto: CreateUserDTO): Promise<UsersEntity>
    {
        const user = await this.UsersRepository.findOneBy({ id: id });
        user.email = dto.email;
        user.password = dto.password;
        return this.UsersRepository.save(user);    
    }

    async CreateUser(dto: CreateUserDTO): Promise<UsersEntity>
    {
        const user = this.UsersRepository.create(dto);
        return this.UsersRepository.save(user);    
    }
};
