import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { RolesService } from './roles.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './access-roles.decorator';
import { strict } from 'assert';

@Injectable()
export class RolesGuard implements CanActivate
{
    constructor(
        private reflector: Reflector,
        private readonly rolesService: RolesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean>
    {
        // get required roles from @AccessRoles() decorator
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredRoles)
        {
            return true; // all users can access endpoint if roles are not defined
        }

        // get user from request after AuthGuard
        const request = context.switchToHttp().getRequest();
        const requestUser = request.user;
        if (!requestUser)
        {
            throw new HttpException('user not authorized', HttpStatus.FORBIDDEN);
        }

        // get list of user roles
        const userId = request.user.id;
        const userRoles = await this.rolesService.GetUserRolesByUserId(userId);

        // true if some of user roles are in required roles
        return userRoles.some((userRole: { roleName: string }) =>
        {
            return requiredRoles.includes(userRole.roleName);
        });
    }
}
