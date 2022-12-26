import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDTO } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from './roles.entity';
import { UsersEntity } from 'src/users/users.entity';
import { UsersRolesEntity } from './users-roles.entity';

@Injectable()
export class RolesService 
{
    constructor(
        @InjectRepository(RolesEntity) private readonly rolesRepository: Repository<RolesEntity>,
        @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
        @InjectRepository(UsersRolesEntity) private readonly usersRolesRepository: Repository<UsersRolesEntity>,
    ){
        this._CheckBasicRoles(); // check the availability of basic roles (USER, ADMIN)
    }

    private async _CheckBasicRoles()
    {
        // add basic roles to database if they not exist
        const roleUser = await this.GetRoleByName('USER');
        if (!roleUser)
        {
            await this.CreateRole({ name: 'USER', description: 'internal user' });
            console.log('USER role created');
            
        }
        const roleAdmin = await this.GetRoleByName('ADMIN');
        if (!roleAdmin)
        {
            await this.CreateRole({ name: 'ADMIN', description: 'powerful admin' });
            console.log('ADMIN role created');
        }
    }

    async GetRoleByName(roleName: string): Promise<RolesEntity>
    {
        const role = await this.rolesRepository.findOneBy({ name: roleName });
        return role;
    }

    async AssignRoleToUser(roleName: string, userId: number): Promise<UsersRolesEntity>
    {
        const role = await this.rolesRepository.findOneBy({ name: roleName });
        const user = await this.usersRepository.findOneBy({ id: userId });
        const userRole = await this.ConnectUserWithRole(user, role);
        return userRole;
    }
    
    async GetAllRoles(): Promise<RolesEntity[]>  
    {
        const roles = await this.rolesRepository.find();
        return roles;
    }
   
    async CreateRole(dto: CreateRoleDTO): Promise<RolesEntity>
    {
        // check of this role already exists
        const candidateRole = await this.rolesRepository.findOneBy({ name: dto.name });
        if (candidateRole)
        {
            throw new HttpException('role already exists', HttpStatus.CONFLICT);   
        }

        const role = this.rolesRepository.create({
            name: dto.name,
            description: dto.description,
        });
        await this.rolesRepository.save(role);
        return role;
    }

    async ConnectUserWithRole(user: UsersEntity, role: RolesEntity): Promise<UsersRolesEntity>
    {
        if (!user || !role)
        {
            throw new HttpException('failed to create user-role relationship', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // create new user-role relationship
        const userRole = this.usersRolesRepository.create({
            user: user,
            role: role
        });
        await this.usersRolesRepository.save(userRole);
        
        return userRole;
    }

    async GetUserRolesByUserId(userId: number): Promise<{ roleName: string }[]>
    {
        const userRoles = await this.usersRolesRepository.query(`
            SELECT users_roles."roleName"
            FROM users_roles
            WHERE users_roles."userId" = $1
        `, [userId]);
        return userRoles;
    }
};
