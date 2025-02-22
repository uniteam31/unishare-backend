import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';

@Module({
	controllers: [],
	providers: [EventsService],
	imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
	exports: [EventsService],
})
export class EventsModule {}
