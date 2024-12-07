import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note-dto';

@Controller('notes')
export class NotesController {
	constructor(private notesService: NotesService) {}

	@Post()
	createNote(@Body() noteDto: CreateNoteDto) {
		return this.notesService.createNote(noteDto);
	}

	@Get()
	getNotes() {
		return this.notesService.getNotes();
	}
}
