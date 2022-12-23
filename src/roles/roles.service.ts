import { Injectable } from '@nestjs/common';
import { CreateRoleDTO } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from './roles.entity';
import { UsersEntity } from 'src/users/users.entity';
import { UsersRolesEntity } from './users-roles.entity';
import { threadId } from 'worker_threads';

@Injectable()
export class RolesService 
{
    constructor(
        @InjectRepository(RolesEntity) private readonly rolesRepository: Repository<RolesEntity>,
        @InjectRepository(UsersRolesEntity) private readonly usersRolesRepository: Repository<UsersRolesEntity>,
    ) {}

    async GetRoleByName(roleName: string): Promise<RolesEntity>
    {
        const role = await this.rolesRepository.findOneBy({ name: roleName });
        return role;
    }

    async CreateRole(dto: CreateRoleDTO): Promise<RolesEntity>
    {
        const role = this.rolesRepository.create({
            name: dto.name,
            description: dto.description,
        });
        await this.rolesRepository.save(role);
        return role;
    }

    async ConnectUserWithRole(user: UsersEntity, role: RolesEntity)
    {
        // create new user-role connection
        const userRole = this.usersRolesRepository.create({
            user: user,
            role: role
        });
        await this.usersRolesRepository.save(userRole);
        return userRole;
    }
};
