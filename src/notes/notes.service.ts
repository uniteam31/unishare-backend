import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './note.schema';
import { CreateNoteDto } from './dto/create-note-dto';

@Injectable()
export class NotesService {
	constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

	async createNote(createNoteDto: CreateNoteDto): Promise<Note> {
		const createdNote = new this.noteModel(createNoteDto);

		return createdNote.save();
	}

	async getNotes(): Promise<Note[]> {
		return this.noteModel.find().exec();
	}
}
