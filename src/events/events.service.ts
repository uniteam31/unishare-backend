import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './event.schema';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';

@Injectable()
export class EventsService {
	constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

	async getEventsByOwnerID(ownerID: User['_id']) {
		const userEvents = await this.eventModel.find({ ownerID });
		return userEvents;
	}

	async getPersonalUserEvent(ownerID: Types.ObjectId, eventID: Types.ObjectId) {
		const event = await this.eventModel.findOne({ _id: eventID, ownerID });

		// TODO возможно в будущем есть смысл разделить "не найдено" и "нет прав"
		if (!event) {
			throw new NotFoundException('Событие не найдено или у вас нет доступа на его просмотр');
		}

		return event;
	}

	async createEvent(ownerID: Types.ObjectId, event: CreateEventDto) {
		const newEvent = new this.eventModel({ ...event, ownerID });

		return await newEvent.save();
	}

	async updateEvent(
		ownerID: Types.ObjectId,
		eventID: Types.ObjectId,
		updateEventDto: UpdateEventDto,
	) {
		const updatedEvent = await this.eventModel.findOneAndUpdate(
			{ _id: eventID, ownerID: ownerID },
			{ $set: { ...updateEventDto } },
			{ new: true },
		);

		if (!updatedEvent) {
			throw new NotFoundException(
				'Событие не найдено или у вас нет прав для его редактирования',
			);
		}

		return updatedEvent;
	}

	async deleteEvent(ownerID: Types.ObjectId, eventID: Types.ObjectId) {
		const deletedEvent = await this.eventModel.findOneAndDelete({ _id: eventID, ownerID });

		// TODO возможно в будущем есть смысл разделить "не найдено" и "нет прав"
		if (!deletedEvent) {
			throw new NotFoundException(
				'Такое событие не найдено у пользователя или у вас нет прав для его удаления',
			);
		}

		return deletedEvent;
	}
}
