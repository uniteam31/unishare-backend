import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './note.schema';
import { CreateNoteDto } from './dto/create-note-dto';
import { UpdateNoteDto } from './dto/update-note-dto';

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
		return this.noteModel
			.find({ creator: { id: userID } })
			.sort({ date: -1 })
			.exec();
	}

	async updateUserNote(
		noteID: Types.ObjectId,
		userID: Types.ObjectId,
		updateNoteDto: UpdateNoteDto,
	) {
		const updatedNote = await this.noteModel.findOneAndUpdate(
			{ _id: noteID, creator: { id: userID } },
			{ $set: updateNoteDto },
			{ new: true },
		);

		if (!updatedNote) {
			throw new NotFoundException(
				'Заметка не найдена или у вас нет прав для ее редактирования',
			);
		}

		return updatedNote;
	}

	async deleteUserNote(noteID: Types.ObjectId, userID: Types.ObjectId) {
		const deletedNote = await this.noteModel.findOneAndDelete({
			_id: noteID,
			creator: { id: userID },
		});

		if (!deletedNote) {
			throw new NotFoundException('Заметка не найдена или у вас нет прав для ее удаления');
		}

		return { message: 'Удалено' };
	}
}
