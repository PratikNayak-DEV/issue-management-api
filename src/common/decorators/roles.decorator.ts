import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator - Marks routes with required roles
 * Used by RolesGuard to enforce authorization
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
