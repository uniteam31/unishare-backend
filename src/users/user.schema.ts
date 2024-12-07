import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие как save(), remove() и т.д.
 * */
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
	@Prop()
	name: string;

	@Prop()
	age: number;

	@Prop()
	sex: 'male' | 'female';
}

/** Основная схема */
export const UserSchema = SchemaFactory.createForClass(User);
