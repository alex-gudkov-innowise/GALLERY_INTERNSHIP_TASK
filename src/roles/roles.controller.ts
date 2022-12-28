import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { AccessRoles } from './access-roles.decorator';

@Controller('/roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ) {}

    @AccessRoles('ADMIN')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Post('/create')
    createRole(@Body() dto: CreateRoleDto) {
        return this.rolesService.createRole(dto);
    }

    @AccessRoles('ADMIN')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Post('/:roleName/assign/:userId')
    assignRoleToUser(
        @Param('roleName') roleName: string, 
        @Param('userId') userId: number
    ) {
        return this.rolesService.assignRoleToUser(roleName, userId);
    }

    @UseGuards(AuthGuard)
    @Get('/')
    getAllRoles() {
        return this.rolesService.getAllRoles();
    }
}
