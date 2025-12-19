import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * TenantGuard - Extracts and validates tenant context from request headers
 * 
 * This guard is responsible for:
 * 1. Extracting user context (userId, organizationId, role) from headers
 * 2. Validating that all required headers are present
 * 3. Injecting user context into request object for downstream use
 * 
 * Multi-tenancy enforcement starts here but is completed in services
 */
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        // Extract tenant context from headers
        const userId = request.headers['x-user-id'];
        const organizationId = request.headers['x-org-id'];
        const role = request.headers['x-user-role'];

        // Validate required headers
        if (!userId || !organizationId || !role) {
            throw new UnauthorizedException(
                'Missing required headers: x-user-id, x-org-id, x-user-role',
            );
        }

        // Validate role enum
        if (role !== 'ADMIN' && role !== 'MEMBER') {
            throw new UnauthorizedException(
                'Invalid role. Must be ADMIN or MEMBER',
            );
        }

        // Inject user context into request
        request.user = {
            userId,
            organizationId,
            role,
        };

        return true;
    }
}
