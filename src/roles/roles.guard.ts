import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './access-roles.decorator';

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
        const userId = request.userId;
        if (!userId)
        {
            throw new HttpException('user not authorized', HttpStatus.FORBIDDEN);
        }

        // get list of user roles
        const userRoles = await this.rolesService.GetUserRolesByUserId(userId);

        // return true if one of user roles is included in required roles
        for (const userRole of userRoles)
        {
            if (requiredRoles.includes(userRole.roleName)) return true;   
        }
    }
}
