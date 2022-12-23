import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService
{
    constructor(
        @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
        private readonly rolesService: RolesService,
    ) {}

    async GetAllUsers(): Promise<UsersEntity[]>
    {
        const allUsers = await this.usersRepository.find();
        return allUsers;
    }

    async GetUserById(id: number): Promise<UsersEntity>
    {
        const user = await this.usersRepository.findOneBy({ id: id });
        return user;
    }

    async GetUserByEmail(email: string): Promise<UsersEntity>
    {
        const user = await this.usersRepository.findOneBy({ email: email });
        return user;
    }

    async DeleteUserById(id: number): Promise<{ id: number }>
    {
        await this.usersRepository.delete({ id: id });
        return { id: id };
    }

    async UpdateUserById(id: number, dto: CreateUserDTO): Promise<UsersEntity>
    {
        const user = await this.usersRepository.findOneBy({ id: id });
        user.email = dto.email;
        user.password = dto.password;
        return await this.usersRepository.save(user);    
    }

    async CreateUser(dto: CreateUserDTO): Promise<UsersEntity>
    {
        // get default role (USER) from database
        const role = await this.rolesService.GetRoleByName('USER');

        // add new user to database
        const user = this.usersRepository.create(dto);
        await this.usersRepository.save(user);    
        
        // create new user-role relationship
        this.rolesService.ConnectUserWithRole(user, role);
        
        return user;
    }
};
