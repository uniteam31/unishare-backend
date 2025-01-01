import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие, как save(), remove() и т.д.
 * */
export type FriendDocument = HydratedDocument<Friend>;

@Schema()
export class Friend {
	_id: Types.ObjectId;

	@Prop({ required: true })
	ownerID: Types.ObjectId;

	@Prop({ default: [] })
	friends: Types.ObjectId[];

	@Prop({ default: [] })
	incomingRequests: Types.ObjectId[];

	@Prop({ default: [] })
	outgoingRequests: Types.ObjectId[];

	/** Все даты в ISO формате */
	@Prop()
	createdAt: string;

	@Prop()
	updatedAt?: string;
}

/** Основная схема */
export const FriendSchema = SchemaFactory.createForClass(Friend);
