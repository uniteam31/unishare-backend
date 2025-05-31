import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note-dto';
import { UpdateNoteDto } from './dto/update-note-dto';
import { formatResponse } from '../common/utils/response.util';
import { ApiResponse } from '../common/utils/response.type';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotesService {
	constructor(private prisma: PrismaService) {}

	async createNote(createNoteDto: CreateNoteDto, ownerID: string, currentSpaceID: string) {
		const createdNote = await this.prisma.note.create({
			data: { ...createNoteDto, ownerID, spaceID: currentSpaceID },
		});

		return formatResponse(createdNote, 'Заметка успешно создана');
	}

	async getSpaceNotes(currentSpaceID: string) {
		const userNotes = await this.prisma.note.findMany({
			where: { spaceID: currentSpaceID },
			orderBy: { createdAt: 'desc' },
		});

		return formatResponse(userNotes, '');
	}

	async updateSpaceNote(noteID: string, ownerID: string, updateNoteDto: UpdateNoteDto) {
		const updatedNote = await this.prisma.note.update({
			where: { id: noteID, ownerID },
			data: {
				...updateNoteDto,
			},
		});

		if (!updatedNote) {
			throw new NotFoundException(
				'Заметка не найдена или у вас нет прав для ее редактирования',
			);
		}

		return formatResponse(updatedNote, 'Заметка успешно обновлена');
	}

	async deleteSpaceNote(noteID: string, ownerID: string): Promise<ApiResponse<null>> {
		const deletedNote = await this.prisma.note.delete({ where: { id: noteID, ownerID } });

		if (!deletedNote) {
			throw new NotFoundException('Заметка не найдена или у вас нет прав для ее удаления');
		}

		return formatResponse(null, 'Заметка удалена');
	}
}
