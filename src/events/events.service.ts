import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
	constructor(private prisma: PrismaService) {}

	private async getEventsByOwnerID(ownerID: string) {
		const userEvents = await this.prisma.calendarEvent.findMany({ where: { ownerID } });
		return userEvents;
	}

	async getPersonalUserEvents(userID: string) {
		const events = await this.getEventsByOwnerID(userID);

		return events;
	}

	async getPersonalUserEvent(ownerID: string, eventID: string) {
		const event = await this.prisma.calendarEvent.findFirst({
			where: { id: eventID, ownerID },
		});

		// TODO возможно в будущем есть смысл разделить "не найдено" и "нет прав"
		if (!event) {
			throw new NotFoundException('Событие не найдено или у вас нет доступа на его просмотр');
		}

		return event;
	}

	async createEvent(ownerID: string, event: CreateEventDto) {
		const newEvent = await this.prisma.calendarEvent.create({
			data: {
				...event,
				owner: { connect: { id: ownerID } },
			},
		});

		return newEvent;
	}

	async updateEvent(ownerID: string, eventID: string, updateEventDto: UpdateEventDto) {
		const updatedEvent = await this.prisma.calendarEvent.update({
			where: { id: eventID, ownerID },
			data: {
				...updateEventDto,
			},
		});

		if (!updatedEvent) {
			throw new NotFoundException(
				'Событие не найдено или у вас нет прав для его редактирования',
			);
		}

		return updatedEvent;
	}

	async deleteEvent(ownerID: string, eventID: string) {
		const deletedEvent = await this.prisma.calendarEvent.delete({
			where: { id: eventID, ownerID },
		});

		// TODO возможно в будущем есть смысл разделить "не найдено" и "нет прав"
		if (!deletedEvent) {
			throw new NotFoundException(
				'Такое событие не найдено у пользователя или у вас нет прав для его удаления',
			);
		}

		return deletedEvent;
	}
}
