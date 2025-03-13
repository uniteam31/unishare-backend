import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CalendarDocument = HydratedDocument<Calendar>;

// export class Friend {
// 	_id: Types.ObjectId;
//
// 	@Prop({ required: true })
// 	ownerID: Types.ObjectId;
//
// 	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
// 	friends: Types.ObjectId[];
//
// 	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
// 	incomingRequestsUserIDs: Types.ObjectId[];
//
// 	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
// 	outgoingRequestsUserIDs: Types.ObjectId[];
// }

@Schema({ timestamps: true })
export class Calendar {
	_id: Types.ObjectId;

	/** Связь с пользователем */
	@Prop({ type: Types.ObjectId, ref: 'User' })
	ownerID: Types.ObjectId;

	/** События, содержащиеся в календаре пользователя */
	@Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }], default: [] })
	events: Types.ObjectId[];
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
