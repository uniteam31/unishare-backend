import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие, как save(), remove() и т.д.
 * */
export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
	_id: Types.ObjectId;

	@Prop({ required: true })
	ownerID: Types.ObjectId;

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	startTime: string;

	@Prop({ required: true })
	endTime: string;

	@Prop()
	description?: string;

	@Prop()
	color?: string;

	@Prop()
	interval?: number;

	@Prop()
	period?: 'day' | 'week' | 'month' | 'year';

	@Prop()
	days?: number[];
}

/** Основная схема */
export const EventSchema = SchemaFactory.createForClass(Event);
