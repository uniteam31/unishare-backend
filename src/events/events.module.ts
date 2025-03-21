import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { EventsController } from './events.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
	controllers: [EventsController],
	providers: [EventsService, PrismaService],
	exports: [EventsService],
	imports: [AuthModule],
})
export class EventsModule {}
