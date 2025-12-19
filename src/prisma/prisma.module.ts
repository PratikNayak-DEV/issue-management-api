import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global Prisma module - makes PrismaService available across app
 */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
