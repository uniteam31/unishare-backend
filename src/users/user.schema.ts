import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие как save(), remove() и т.д.
 * */
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
	_id: Types.ObjectId;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop()
	firstName: string;

	@Prop({ required: true, unique: true })
	username: string;
}

/** Основная схема */
export const UserSchema = SchemaFactory.createForClass(User);
