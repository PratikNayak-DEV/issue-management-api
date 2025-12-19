import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IssueStatus } from '@prisma/client';

/**
 * DTO for updating an existing issue
 */
export class UpdateIssueDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(IssueStatus)
    @IsOptional()
    status?: IssueStatus;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsString()
    @IsOptional()
    assigneeId?: string;
}
