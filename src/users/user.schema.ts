import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** HydratedDocument используется для типизации документов, которые возвращаются из базы данных.
 * Это типизированный объект, который включает в себя все методы Mongoose,
 * такие как save(), remove() и т.д.
 * */
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	_id: Types.ObjectId;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop()
	firstName: string;

	@Prop()
	lastName: string;

	@Prop({ required: true, unique: true })
	username: string;

	// TODO расхардкодить
	@Prop({
		default:
			'https://avatars.mds.yandex.net/i?id=29f7366ac823f46165612d9480e60f0e_l-13215132-images-thumbs&n=13',
	})
	avatar: string;
}

/** Основная схема */
export const UserSchema = SchemaFactory.createForClass(User);
