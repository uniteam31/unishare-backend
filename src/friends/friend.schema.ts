import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие, как save(), remove() и т.д.
 * */
export type FriendDocument = HydratedDocument<Friend>;

@Schema({ timestamps: true })
export class Friend {
	_id: Types.ObjectId;

	@Prop({ required: true })
	ownerID: Types.ObjectId;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	friends: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	incomingRequestsUserIDs: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	outgoingRequestsUserIDs: Types.ObjectId[];
}

/** Основная схема */
export const FriendSchema = SchemaFactory.createForClass(Friend);
