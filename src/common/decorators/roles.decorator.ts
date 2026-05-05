import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to specific user roles.
 * Role IDs match the User_Role table: '1'=student, '2'=teacher, '3'=sales_manager, '4'=admin
 * Usage: @Roles('3', '4')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
