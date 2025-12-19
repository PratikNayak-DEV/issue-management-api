import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [ActivityModule],
    controllers: [IssuesController],
    providers: [IssuesService],
})
export class IssuesModule { }
