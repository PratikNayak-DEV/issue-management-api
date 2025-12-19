import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

/**
 * ActivityService - Manages activity logging
 * 
 * Responsibilities:
 * - Create activity logs for issue changes
 * - Track status and assignee changes
 */
@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log an activity for issue changes
     */
    async logActivity(data: {
        issueId: string;
        actionType: ActivityType;
        oldValue?: string;
        newValue?: string;
        performedBy: string;
    }) {
        return this.prisma.activityLog.create({
            data: {
                issueId: data.issueId,
                actionType: data.actionType,
                oldValue: data.oldValue,
                newValue: data.newValue,
                performedBy: data.performedBy,
            },
        });
    }

    async getActivitiesByIssue(issueId: string) {
        return this.prisma.activityLog.findMany({
            where: { issueId },
            orderBy: { performedAt: 'desc' },
            include: {
                performedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}
