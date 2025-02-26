import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user-dto';
import { formatResponse } from '../common/utils/response.util';
import { FriendsService } from '../friends/friends.service';
import type { FriendStatus } from '../friends/types/friend.types';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data-dto';
import { UpdateUserAuthenticationDataDto } from './dto/update-user-authentication-data-dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
	) {}

	async createUser(createUserDto: CreateUserDto): Promise<User> {
		const createdUser = new this.userModel(createUserDto);
		/** здесь exec() не нужен, потому что мы уже знаем, что выполняем асинхронную
		 * операцию
		 * */
		return createdUser.save();
	}

	async getUserByEmail(email: string) {
		return this.userModel.findOne({ email }).exec();
	}

	async getUserByUsername(username: string) {
		return this.userModel.findOne({ username }).exec();
	}

	async getUserByID(id: Types.ObjectId) {
		return this.userModel.findById(id).exec();
	}

	async getUsersByUsernameWithFriendStatus(
		ownerID: Types.ObjectId,
		username: User['username'] = '',
	) {
		const foundedUsers = await this.userModel
			.find({ username: { $regex: username, $options: 'i' } })
			.select('_id avatar username firstName')
			.lean();

		const ownerFriendsEntity = await this.friendsService.getFriendsEntity(ownerID);

		const foundUsersWithFriendStatus = foundedUsers.map((user) => {
			let friendStatus: FriendStatus = null;

			if (ownerFriendsEntity.incomingRequestsUserIDs.includes(user._id)) {
				friendStatus = 'pendingAcceptance';
			}

			if (ownerFriendsEntity.outgoingRequestsUserIDs.includes(user._id)) {
				friendStatus = 'sent';
			}

			if (ownerFriendsEntity.friends.includes(user._id)) {
				friendStatus = 'friend';
			}

			return {
				...user,
				friendStatus,
			};
		});

		return formatResponse(foundUsersWithFriendStatus, 'Список успешно получен');
	}

	async getUserPersonalData(userID: Types.ObjectId) {
		const personalData = await this.userModel
			.findOne({ _id: userID })
			.select('_id avatar username firstName lastName');

		if (!personalData) {
			throw new NotFoundException('Такой пользователь не найден или у вас нет доступа');
		}

		return personalData;
	}

	async updateUserPersonalData(
		userID: Types.ObjectId,
		updateUserPersonalDataDto: UpdateUserPersonalDataDto,
	) {
		if (updateUserPersonalDataDto.username) {
			const candidate = await this.userModel.findOne({
				username: updateUserPersonalDataDto.username,
			});

			if (candidate) {
				throw new BadRequestException(
					'Пользователь с таким именем пользователя уже существует',
				);
			}
		}

		const updatedPersonalData = await this.userModel
			.findOneAndUpdate(
				{ _id: userID },
				{ $set: { ...updateUserPersonalDataDto } },
				{ new: true },
			)
			.select('_id avatar username firstName lastName');

		if (!updatedPersonalData) {
			throw new NotFoundException(
				'Такого пользователя нет или у вас нет прав для редактирования',
			);
		}

		return updatedPersonalData;
	}

	async getUserAuthenticationData(userID: Types.ObjectId) {
		const authenticationData = await this.userModel
			.findOne({ _id: userID })
			.select('email educationalEmail');

		if (!authenticationData) {
			throw new NotFoundException('Такой пользователь не найден или у вас нет доступа');
		}

		return authenticationData;
	}

	async updateUserAuthenticationData(
		userID: Types.ObjectId,
		updateUserAuthenticationDataDto: UpdateUserAuthenticationDataDto,
	) {
		const updatedAuthenticationData = await this.userModel
			.findOneAndUpdate(
				{ _id: userID },
				{ $set: { ...updateUserAuthenticationDataDto } },
				{ new: true },
			)
			.select('email educationalEmail');

		if (!updatedAuthenticationData) {
			throw new NotFoundException(
				'Такого пользователя нет или у вас нет прав для редактирования',
			);
		}

		return updatedAuthenticationData;
	}
}
