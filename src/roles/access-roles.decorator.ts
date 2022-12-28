import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles_key_1234';

export function AccessRoles(...roles: string[]) {
    // just forward roles
    return SetMetadata(ROLES_KEY, roles);
}
