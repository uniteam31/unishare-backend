import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async createUser(createUserDto: CreateUserDto): Promise<User> {
		const createdUser = new this.userModel(createUserDto);
		/** здесь exec() не нужен, потому что мы уже знаем, что выполняем асинхронную
		 * операцию
		 * */
		return createdUser.save();
	}

	async findAll(): Promise<User[]> {
		/** exec() нужен для явного указания того, что мы возвращаем промис */
		return this.userModel.find().exec();
	}
}
