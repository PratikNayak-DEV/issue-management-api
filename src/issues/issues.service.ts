import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { ActivityType, IssueStatus } from '@prisma/client';

/**
 * IssuesService - Core business logic for issue management
 * 
 * Multi-tenancy enforcement:
 * - All queries include organizationId filter
 * - Cross-organization access is impossible
 * - 404 is returned for issues not in user's org (preventing data leakage)
 */
@Injectable()
export class IssuesService {
    constructor(
        private prisma: PrismaService,
        private activityService: ActivityService,
    ) { }

    /**
     * Create a new issue
     * Automatically scoped to user's organization
     */
    async create(
        createIssueDto: CreateIssueDto,
        userId: string,
        organizationId: string,
    ) {
        // Validate assignee belongs to same organization (if provided)
        if (createIssueDto.assigneeId) {
            const assignee = await this.prisma.user.findFirst({
                where: {
                    id: createIssueDto.assigneeId,
                    organizationId, // Tenant isolation
                },
            });

            if (!assignee) {
                throw new ForbiddenException(
                    'Assignee must belong to your organization',
                );
            }
        }

        // Create issue with tenant scope
        const issue = await this.prisma.issue.create({
            data: {
                title: createIssueDto.title,
                description: createIssueDto.description,
                priority: createIssueDto.priority,
                organizationId, // Tenant isolation
                createdById: userId,
                assigneeId: createIssueDto.assigneeId,
                status: IssueStatus.OPEN,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                assignee: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Log creation activity
        await this.activityService.logActivity({
            issueId: issue.id,
            actionType: ActivityType.CREATED,
            performedBy: userId,
        });

        return issue;
    }

    /**
     * Find all issues in user's organization
     * Automatically filtered by organizationId
     */
    async findAll(organizationId: string) {
        return this.prisma.issue.findMany({
            where: {
                organizationId, // Tenant isolation
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                assignee: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find issue by ID within user's organization
     * Returns 404 if issue doesn't exist OR belongs to different org
     */
    async findOne(id: string, organizationId: string) {
        const issue = await this.prisma.issue.findFirst({
            where: {
                id,
                organizationId, // Tenant isolation - prevents cross-org access
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                assignee: {
                    select: { id: true, name: true, email: true },
                },
                activities: {
                    orderBy: { performedAt: 'desc' },
                    include: {
                        performedByUser: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });

        if (!issue) {
            throw new NotFoundException('Issue not found');
        }

        return issue;
    }

    /**
     * Update issue
     * Enforces tenant isolation and logs changes
     */
    async update(
        id: string,
        updateIssueDto: UpdateIssueDto,
        userId: string,
        organizationId: string,
    ) {
        // Verify issue exists in user's organization
        const existingIssue = await this.findOne(id, organizationId);

        // Validate assignee belongs to same organization (if being changed)
        if (updateIssueDto.assigneeId) {
            const assignee = await this.prisma.user.findFirst({
                where: {
                    id: updateIssueDto.assigneeId,
                    organizationId, // Tenant isolation
                },
            });

            if (!assignee) {
                throw new ForbiddenException(
                    'Assignee must belong to your organization',
                );
            }
        }

        // Track changes for activity log
        const changes: Array<{
            actionType: ActivityType;
            oldValue?: string;
            newValue?: string;
        }> = [];

        // Check status change
        if (
            updateIssueDto.status &&
            updateIssueDto.status !== existingIssue.status
        ) {
            changes.push({
                actionType: ActivityType.STATUS_CHANGED,
                oldValue: existingIssue.status,
                newValue: updateIssueDto.status,
            });
        }

        // Check assignee change
        if (
            updateIssueDto.assigneeId !== undefined &&
            updateIssueDto.assigneeId !== existingIssue.assigneeId
        ) {
            changes.push({
                actionType: ActivityType.ASSIGNEE_CHANGED,
                oldValue: existingIssue.assigneeId || 'unassigned',
                newValue: updateIssueDto.assigneeId || 'unassigned',
            });
        }

        // Update issue
        const updatedIssue = await this.prisma.issue.update({
            where: { id },
            data: updateIssueDto,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                assignee: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Log activities
        for (const change of changes) {
            await this.activityService.logActivity({
                issueId: id,
                actionType: change.actionType,
                oldValue: change.oldValue,
                newValue: change.newValue,
                performedBy: userId,
            });
        }

        // Log general update if no specific changes tracked
        if (changes.length === 0) {
            await this.activityService.logActivity({
                issueId: id,
                actionType: ActivityType.UPDATED,
                performedBy: userId,
            });
        }

        return updatedIssue;
    }

    /**
     * Delete issue
     * Enforces tenant isolation
     */
    async remove(id: string, userId: string, organizationId: string) {
        // Verify issue exists in user's organization
        await this.findOne(id, organizationId);

        // Log deletion before removing
        await this.activityService.logActivity({
            issueId: id,
            actionType: ActivityType.DELETED,
            performedBy: userId,
        });

        // Delete issue (cascade will handle activities)
        await this.prisma.issue.delete({
            where: { id },
        });

        return { message: 'Issue deleted successfully' };
    }
}
