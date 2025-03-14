import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { Event } from '../events/event.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Calendar } from './calendar.schema';
import { UsersService } from '../users/users.service';
import { CreateEventDto } from '../events/dto/create-event-dto';
import { UpdateEventDto } from '../events/dto/update-event-dto';

@Injectable()
export class CalendarsService {
	constructor(
		@Inject(forwardRef(() => EventsService)) private eventsService: EventsService,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
		@InjectModel(Calendar.name) private calendarModel: Model<Calendar>,
	) {}

	private async checkCalendarEntityAndCreateIfEmpty(ownerID: Types.ObjectId) {
		const calendarEntity = await this.calendarModel.findOne({ ownerID });

		if (!calendarEntity) {
			const user = await this.usersService.getUserByID(ownerID);

			if (!user) {
				throw new NotFoundException('Пользователь не найден');
			}

			await this.createCalendarEntity(ownerID);
		}
	}

	private async createCalendarEntity(ownerID: Types.ObjectId) {
		const newFriendEntity = new this.calendarModel({
			ownerID,
		});

		return newFriendEntity.save();
	}

	async getPersonalUserEvents(ownerID: Types.ObjectId) {
		await this.checkCalendarEntityAndCreateIfEmpty(ownerID);

		const calendarEntity = await this.calendarModel.findOne({ ownerID });

		const populatedUserEvents = await calendarEntity.populate<{ events: Event[] }>({
			model: 'Event',
			path: 'events',
		});

		const leanEventsEntity = populatedUserEvents.toObject<{ events: Event[] }>();

		return leanEventsEntity.events;
	}

	async getPersonalUserEvent(ownerID: Types.ObjectId, eventID: Types.ObjectId) {
		await this.checkCalendarEntityAndCreateIfEmpty(ownerID);

		const event = await this.eventsService.getPersonalUserEvent(ownerID, eventID);

		return event;
	}

	async createEvent(ownerID: Types.ObjectId, createEventDto: CreateEventDto) {
		await this.checkCalendarEntityAndCreateIfEmpty(ownerID);

		const newEvent = await this.eventsService.createEvent(ownerID, createEventDto);

		await this.calendarModel.updateOne({ ownerID }, { $addToSet: { events: newEvent._id } });

		return newEvent;
	}

	async updateEvent(
		ownerID: Types.ObjectId,
		eventID: Types.ObjectId,
		updateEventDto: UpdateEventDto,
	) {
		await this.checkCalendarEntityAndCreateIfEmpty(ownerID);

		const updatedEvent = await this.eventsService.updateEvent(ownerID, eventID, updateEventDto);

		return updatedEvent;
	}

	async deleteEvent(ownerID: Types.ObjectId, eventID: Types.ObjectId) {
		await this.checkCalendarEntityAndCreateIfEmpty(ownerID);

		const deletedEvent = await this.eventsService.deleteEvent(ownerID, eventID);

		await this.calendarModel.updateOne({ ownerID }, { $pull: { events: eventID } });

		return deletedEvent;
	}
}
