import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие как save(), remove() и т.д.
 * */
export type NoteDocument = HydratedDocument<Note>;

@Schema()
export class Note {
	@Prop()
	id: number;

	@Prop()
	author: string;

	@Prop()
	title: string;

	@Prop()
	text: string;

	@Prop({ default: () => new Date().toISOString() }) // Текущая дата в ISO формате
	date: string;
}

/** Основная схема */
export const NoteSchema = SchemaFactory.createForClass(Note);
