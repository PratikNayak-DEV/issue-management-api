import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * RolesGuard - Enforces role-based authorization
 * 
 * This guard:
 * 1. Checks if route requires specific roles (via @Roles decorator)
 * 2. Compares user's role against required roles
 * 3. Blocks access if user lacks required permissions
 * 
 * Authorization logic lives in Guard (not Service) because:
 * - Guards run before business logic, failing fast
 * - Separation of concerns: authorization vs business rules
 * - Reusable across multiple endpoints
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Get required roles from route metadata
        const requiredRoles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );

        // If no roles specified, allow access
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if user has required role
        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'You do not have permission to perform this action',
            );
        }

        return true;
    }
}
