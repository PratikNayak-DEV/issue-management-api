import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

/**
 * DTO for creating a new issue
 */
export class CreateIssueDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsString()
    @IsOptional()
    assigneeId?: string;
}
