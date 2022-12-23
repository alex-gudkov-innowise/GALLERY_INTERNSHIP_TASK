import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateRoleDTO } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { AccessRoles } from './access-roles.decorator';

@Controller('roles')
export class RolesController
{
    constructor(
        private readonly rolesService: RolesService,
    ) {}

    @AccessRoles('ADMIN')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Post('create')
    CreateRole(
        @Body() dto: CreateRoleDTO
    ){
        return this.rolesService.CreateRole(dto);
    }

    @AccessRoles('ADMIN')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Post(':roleName/assign/:userId')
    AssignRoleToUser(
        @Param('roleName') roleName: string,
        @Param('userId') userId: number,
    ){
        return this.rolesService.AssignRoleToUser(roleName, userId);
    }

    @UseGuards(AuthGuard)
    @Get()
    GetAllRoles()
    {
        return this.rolesService.GetAllRoles();
    }
};
