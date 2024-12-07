import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
	constructor(private notesService: NotesService) {}

	@Post()
	createNote(@Body() createNoteDto: CreateNoteDto, @Request() req: IAuthenticatedRequest) {
		const creatorID = req.user._id;

		return this.notesService.createNote(createNoteDto, creatorID);
	}

	@Get()
	getUserNotes(@Request() req: IAuthenticatedRequest) {
		const userID = req.user._id;

		return this.notesService.getUserNotes(userID);
	}
}
