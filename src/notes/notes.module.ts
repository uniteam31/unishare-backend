import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './note.schema';

@Module({
	controllers: [NotesController],
	providers: [NotesService],
	imports: [
		/** Регистрация схемы в NestJS и связывание с MongoDB */
		MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
	],
})
export class NotesModule {}
