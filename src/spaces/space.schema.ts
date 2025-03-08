import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие, как save(), remove() и т.д.
 * */
export type SpaceDocument = HydratedDocument<Space>;

@Schema({ timestamps: true })
export class Space {
	_id: Types.ObjectId;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	ownerID: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	membersIDs: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	editorsIDs: Types.ObjectId[];
}

/** Основная схема */
export const SpaceSchema = SchemaFactory.createForClass(Space);
