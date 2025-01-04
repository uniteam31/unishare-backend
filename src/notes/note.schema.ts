import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие, как save(), remove() и т.д.
 * */
export type NoteDocument = HydratedDocument<Note>;

export type NoteCreator = {
	id: Types.ObjectId;
};

@Schema()
export class Note {
	/** Поле, представляющее связь с пользователем */
	@Prop({ required: true })
	ownerID: Types.ObjectId;

	@Prop()
	title: string;

	@Prop()
	text: string;

	@Prop({ default: () => new Date().toISOString() }) // Текущая дата в ISO формате
	createdAt: string;

	@Prop({ default: () => new Date().toISOString() }) // Текущая дата в ISO формате
	updatedAt: string;
}

/** Основная схема */
export const NoteSchema = SchemaFactory.createForClass(Note);
