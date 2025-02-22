import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { Calendar, CalendarSchema } from './calendar.schema';
import { EventsModule } from '../events/events.module';

@Module({
	providers: [CalendarsService],
	controllers: [CalendarsController],
	imports: [
		MongooseModule.forFeature([{ name: Calendar.name, schema: CalendarSchema }]),
		AuthModule,
		UsersModule,
		EventsModule,
	],
})
export class CalendarsModule {}
