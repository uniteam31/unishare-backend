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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { UpdateNoteDto } from './dto/update-note-dto';
import { SpaceAccessGuard } from '../spaces/space-access.guard';

@UseGuards(JwtAuthGuard, SpaceAccessGuard)
@Controller('notes')
export class NotesController {
	constructor(private notesService: NotesService) {}

	@Post()
	createNote(@Body() createNoteDto: CreateNoteDto, @Request() req: IAuthenticatedRequest) {
		const currentSpace = req.currentSpaceID;
		const ownerID = req.user.id;

		return this.notesService.createNote(createNoteDto, ownerID, currentSpace);
	}

	@Get()
	getSpaceNotes(@Request() req: IAuthenticatedRequest) {
		const currentSpaceID = req.currentSpaceID;

		return this.notesService.getSpaceNotes(currentSpaceID);
	}

	@Put(':id')
	updateSpaceNote(
		@Param('id') noteID: string,
		@Body() updateNoteDto: UpdateNoteDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const ownerID = req.user.id;

		return this.notesService.updateSpaceNote(noteID, ownerID, updateNoteDto);
	}

	@Delete(':id')
	deleteSpaceNote(@Param('id') noteID: string, @Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		return this.notesService.deleteSpaceNote(noteID, ownerID);
	}
}
