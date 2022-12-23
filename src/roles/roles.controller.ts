import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRoleDTO } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController
{
    constructor(
        private readonly rolesService: RolesService,
    ) {}

    @Post('create')
    CreateRole(
        @Body() dto: CreateRoleDTO
    ){
        return this.rolesService.CreateRole(dto);
    }

    @Get(':roleName')
    GetRoleByName(
        @Param('roleName') roleName: string
    ){
        return this.rolesService.GetRoleByName(roleName);
    }
};
