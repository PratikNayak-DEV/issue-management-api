import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, UserContext } from '../common/decorators/user.decorator';
import { Role } from '../common/enums/role.enum';

/**
 * IssuesController - REST endpoints for issue management
 * 
 * Guards:
 * - TenantGuard: Validates and injects user context
 * - RolesGuard: Enforces role-based permissions
 */
@Controller('issues')
@UseGuards(TenantGuard, RolesGuard) // Apply to all routes
export class IssuesController {
    constructor(private readonly issuesService: IssuesService) { }

    /**
     * POST /issues
     * Create new issue
     * Accessible by: ADMIN and MEMBER
     */
    @Post()
    create(
        @Body(ValidationPipe) createIssueDto: CreateIssueDto,
        @CurrentUser() user: UserContext,
    ) {
        return this.issuesService.create(
            createIssueDto,
            user.userId,
            user.organizationId,
        );
    }

    /**
     * GET /issues
     * List all issues in organization
     * Accessible by: ADMIN and MEMBER
     */
    @Get()
    findAll(@CurrentUser() user: UserContext) {
        return this.issuesService.findAll(user.organizationId);
    }

    /**
     * GET /issues/:id
     * Get single issue by ID
     * Accessible by: ADMIN and MEMBER
     */
    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: UserContext) {
        return this.issuesService.findOne(id, user.organizationId);
    }

    /**
     * PATCH /issues/:id
     * Update issue
     * Accessible by: ADMIN only (for status/assignee changes)
     * 
     * Note: Business logic allows MEMBER to update non-sensitive fields,
     * but guard restricts endpoint to ADMIN for simplicity in 2-hour scope
     */
    @Patch(':id')
    @Roles(Role.ADMIN) // Only ADMIN can update
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateIssueDto: UpdateIssueDto,
        @CurrentUser() user: UserContext,
    ) {
        return this.issuesService.update(
            id,
            updateIssueDto,
            user.userId,
            user.organizationId,
        );
    }

    /**
     * DELETE /issues/:id
     * Delete issue
     * Accessible by: ADMIN only
     */
    @Delete(':id')
    @Roles(Role.ADMIN) // Only ADMIN can delete
    remove(@Param('id') id: string, @CurrentUser() user: UserContext) {
        return this.issuesService.remove(id, user.userId, user.organizationId);
    }
}
