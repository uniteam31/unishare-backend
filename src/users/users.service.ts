import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user-dto';
import { formatResponse } from '../common/utils/response.util';
import { FriendsService } from '../friends/friends.service';
import type { FriendStatus } from '../friends/types/friend.types';

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
}
