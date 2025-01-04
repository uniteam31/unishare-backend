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
import { Types } from 'mongoose';
import { UpdateNoteDto } from './dto/update-note-dto';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
	constructor(private notesService: NotesService) {}

	@Post()
	createNote(@Body() createNoteDto: CreateNoteDto, @Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.notesService.createNote(createNoteDto, ownerID);
	}

	@Get()
	getUserNotes(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.notesService.getUserNotes(ownerID);
	}

	@Put(':id')
	updateUserNote(
		@Param('id') noteID: Types.ObjectId,
		@Body() updateNoteDto: UpdateNoteDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const ownerID = req.user._id;

		return this.notesService.updateUserNote(noteID, ownerID, updateNoteDto);
	}

	@Delete(':id')
	deleteUserNote(@Param('id') noteID: Types.ObjectId, @Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.notesService.deleteUserNote(noteID, ownerID);
	}
}
