import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './note.schema';
import { CreateNoteDto } from './dto/create-note-dto';

@Injectable()
export class NotesService {
	constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

	// TODO в будущем всегда ставить принадлежность ноды для конкретной группы
	async createNote(createNoteDto: CreateNoteDto, creatorID: Types.ObjectId): Promise<Note> {
		const date = new Date().toISOString();

		const createdNote = new this.noteModel({
			...createNoteDto,
			date,
			creator: { id: creatorID },
		});

		return createdNote.save();
	}

	async getUserNotes(userID: Types.ObjectId): Promise<Note[]> {
		return this.noteModel.find({ creator: { id: userID } }).exec();
	}
}
