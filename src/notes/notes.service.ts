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
	async createNote(createNoteDto: CreateNoteDto, ownerID: Types.ObjectId): Promise<Note> {
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const createdNote = new this.noteModel({
			...createNoteDto,
			createdAt,
			updatedAt,
			ownerID,
		});

		return createdNote.save();
	}

	async getUserNotes(ownerID: Types.ObjectId): Promise<Note[]> {
		return this.noteModel.find({ ownerID }).sort({ date: -1 }).exec();
	}

	async updateUserNote(
		noteID: Types.ObjectId,
		ownerID: Types.ObjectId,
		updateNoteDto: UpdateNoteDto,
	) {
		const updatedAt = new Date().toISOString();

		const updatedNote = await this.noteModel.findOneAndUpdate(
			{ _id: noteID, ownerID },
			{ $set: { ...updateNoteDto, updatedAt } },
			{ new: true },
		);

		if (!updatedNote) {
			throw new NotFoundException(
				'Заметка не найдена или у вас нет прав для ее редактирования',
			);
		}

		return updatedNote;
	}

	async deleteUserNote(noteID: Types.ObjectId, ownerID: Types.ObjectId) {
		const deletedNote = await this.noteModel.findOneAndDelete({
			_id: noteID,
			ownerID,
		});

		if (!deletedNote) {
			throw new NotFoundException('Заметка не найдена или у вас нет прав для ее удаления');
		}

		return { message: 'Удалено' };
	}
}
