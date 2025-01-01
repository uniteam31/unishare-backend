import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from './friend.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsService {
	constructor(
		@InjectModel(Friend.name) private friendModel: Model<Friend>,
		private usersService: UsersService,
	) {}

	private async checkFriendsEntity(ownerID: Types.ObjectId) {
		const friendsEntity = await this.friendModel.findOne({ ownerID });

		if (!friendsEntity) {
			const user = await this.usersService.getUserByID(ownerID);

			if (!user) {
				throw new NotFoundException('Пользователь не найден');
			}

			await this.createFriendsEntity(ownerID);
		}
	}

	/** Создание сущности для друзей пользователя */
	async createFriendsEntity(ownerID: Types.ObjectId) {
		const currentData = new Date().toISOString();

		const newFriendEntity = new this.friendModel({
			ownerID,
			createdAt: currentData,
		});

		return newFriendEntity.save();
	}

	/** Возвращает список друзей по id владельца и если сущности нет, то создает новую  */
	async getFriendsListByOwnerID(ownerID: Types.ObjectId) {
		await this.checkFriendsEntity(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		return friendsEntity.friends;
	}

	async getIncomingRequestsByOwnerID(ownerID: Types.ObjectId) {
		await this.checkFriendsEntity(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		return friendsEntity.incomingRequests;
	}

	async getOutgoingRequestsByOwnerID(ownerID: Types.ObjectId) {
		await this.checkFriendsEntity(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		return friendsEntity.outgoingRequests;
	}
}
