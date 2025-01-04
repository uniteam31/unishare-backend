import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './note.schema';
import { CreateNoteDto } from './dto/create-note-dto';
import { UpdateNoteDto } from './dto/update-note-dto';
import { formatResponse } from '../common/utils/response.util';
import { ApiResponse } from '../common/utils/response.type';

@Injectable()
export class NotesService {
	constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

	// TODO в будущем всегда ставить принадлежность ноды для конкретной группы
	async createNote(
		createNoteDto: CreateNoteDto,
		ownerID: Types.ObjectId,
	): Promise<ApiResponse<Note>> {
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const createdNote = new this.noteModel({
			...createNoteDto,
			createdAt,
			updatedAt,
			ownerID,
		});

		return formatResponse<Note>(await createdNote.save(), 'Заметка успешно создана');
	}

	async getUserNotes(ownerID: Types.ObjectId): Promise<ApiResponse<Note[]>> {
		const userNotes = await this.noteModel.find({ ownerID }).sort({ createdAt: -1 });

		return formatResponse<Note[]>(userNotes, '');
	}

	async updateUserNote(
		noteID: Types.ObjectId,
		ownerID: Types.ObjectId,
		updateNoteDto: UpdateNoteDto,
	): Promise<ApiResponse<Note>> {
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

		return formatResponse<Note>(updatedNote, 'Заметка успешно обновлена');
	}

	async deleteUserNote(
		noteID: Types.ObjectId,
		ownerID: Types.ObjectId,
	): Promise<ApiResponse<null>> {
		const deletedNote = await this.noteModel.findOneAndDelete({
			_id: noteID,
			ownerID,
		});

		if (!deletedNote) {
			throw new NotFoundException('Заметка не найдена или у вас нет прав для ее удаления');
		}

		return formatResponse(null, 'Заметка удалена');
	}
}
