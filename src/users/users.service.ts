import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService
{
    constructor(
        @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
        private readonly rolesService: RolesService,
    ){
        this._CheckMainAdmin(); // check the availability of main admin
    }

    private async _CheckMainAdmin()
    {
        // add main admin to database if it not exist
        let mainAdmin: UsersEntity = await this.usersRepository.findOneBy({ email: process.env.MAIN_ADMIN_MAIL });
        if (!mainAdmin)
        {
            // get admin role
            const adminRole = await this.rolesService.GetRoleByName('ADMIN');
            
            // create admin user
            const dto: CreateUserDTO = {
                email: process.env.MAIN_ADMIN_MAIL,
                password: await hash(process.env.MAIN_ADMIN_PASSWORD, 5),
                name: process.env.MAIN_ADMIN_NAME,
                bio: process.env.MAIN_ADMIN_BIO
            };
            mainAdmin = await this.CreateUser(dto);
            console.log(mainAdmin);
            
            // give him admin role 
            await this.rolesService.ConnectUserWithRole(mainAdmin, adminRole);
        }
    }

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

    async CreateUser(dto: CreateUserDTO): Promise<UsersEntity>
    {
        // get default role (USER) from database
        const role = await this.rolesService.GetRoleByName('USER');
        if (!role)
        {
            throw new HttpException('default role not exists', HttpStatus.BAD_REQUEST);
        }

        // add new user to database
        const user = this.usersRepository.create(dto);
        await this.usersRepository.save(user);    
        
        // create new user-role relationship
        this.rolesService.ConnectUserWithRole(user, role);
        
        return user;
    }

    async IsUserAdmin(userId: number): Promise<boolean>
    {
        const userRoles = await this.rolesService.GetUserRolesByUserId(userId);
        for (const userRole of userRoles)
        {
            if (userRole.roleName === 'ADMIN') return true;   
        }
    }
};
