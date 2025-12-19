import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserContext {
  userId: string;
  organizationId: string;
  role: string;
}

/**
 * Custom decorator to extract user context from request
 * User context is injected by TenantGuard from headers
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
