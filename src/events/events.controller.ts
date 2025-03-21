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
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { CreateEventDto } from './dto/create-event-dto';
import { UpdateEventDto } from './dto/update-event-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
	constructor(private eventsService: EventsService) {}

	@Get('')
	async getPersonalUserEvents(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		const userEvents = await this.eventsService.getPersonalUserEvents(ownerID);

		return formatResponse(userEvents, 'События найдены успешно');
	}

	@Get(':id')
	async getPersonalUserEvent(
		@Request() req: IAuthenticatedRequest,
		@Param('id') eventID: string,
	) {
		const ownerID = req.user.id;

		const userEvents = await this.eventsService.getPersonalUserEvent(ownerID, eventID);

		return formatResponse(userEvents, 'Событие найдено успешно');
	}

	@Post('')
	async createEvent(
		@Body() createEventDto: CreateEventDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const ownerID = req.user.id;

		const event = await this.eventsService.createEvent(ownerID, createEventDto);

		return formatResponse(event, 'Событие успешно создано');
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
	async updateEvent(
		@Body() updateEventDto: UpdateEventDto,
		@Request() req: IAuthenticatedRequest,
		@Param('id') eventID: string,
	) {
		const ownerID = req.user.id;

		const updatedEvent = await this.eventsService.updateEvent(ownerID, eventID, updateEventDto);

		return formatResponse(updatedEvent, 'Событие успешно обновлено');
	}

	@Delete(':id')
	async deleteEvent(@Param('id') eventID: string, @Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		const deletedEvent = await this.eventsService.deleteEvent(ownerID, eventID);

		return formatResponse(deletedEvent, 'Событие успешно удалено');
	}
}
