import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { CalendarsService } from './calendars.service';
import { formatResponse } from '../common/utils/response.util';
import { CreateEventDto } from '../events/dto/create-event-dto';
import { Types } from 'mongoose';
import { UpdateEventDto } from '../events/dto/update-event-dto';

@Controller('calendars')
@UseGuards(JwtAuthGuard)
export class CalendarsController {
	constructor(private calendarService: CalendarsService) {}

	@Get('events')
	async getPersonalUserEvents(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		const userEvents = await this.calendarService.getPersonalUserEvents(ownerID);

		return formatResponse(userEvents, 'События найдены успешно');
	}

	@Get('events/:id')
	async getPersonalUserEvent(
		@Request() req: IAuthenticatedRequest,
		@Param('id') eventID: Types.ObjectId,
	) {
		const ownerID = req.user._id;

		const userEvents = await this.calendarService.getPersonalUserEvent(ownerID, eventID);

		return formatResponse(userEvents, 'Событие найдено успешно');
	}

	@Post('events')
	async createEvent(
		@Body() createEventDto: CreateEventDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const ownerID = req.user._id;

		const event = await this.calendarService.createEvent(ownerID, createEventDto);

		return formatResponse(event, 'Событие успешно создано');
	}

	@Put('events/:id')
	async updateEvent(
		@Body() updateEventDto: UpdateEventDto,
		@Request() req: IAuthenticatedRequest,
		@Param('id') eventID: Types.ObjectId,
	) {
		const ownerID = req.user._id;

		const updatedEvent = await this.calendarService.updateEvent(
			ownerID,
			eventID,
			updateEventDto,
		);

		return formatResponse(updatedEvent, 'Событие успешно обновлено');
	}

	@Delete('events/:id')
	async deleteEvent(@Param('id') eventID: Types.ObjectId, @Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		const deletedEvent = await this.calendarService.deleteEvent(ownerID, eventID);

		return formatResponse(deletedEvent, 'Событие успешно удалено');
	}
}
