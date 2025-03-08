import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friend } from './friend.schema';
import { UsersService } from '../users/users.service';
import { formatResponse } from '../common/utils/response.util';
import type { User } from '../users/user.schema';
import type { PublicUser } from '../users/types/user.types';

@Injectable()
export class FriendsService {
	constructor(
		@InjectModel(Friend.name) private friendModel: Model<Friend>,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
	) {}

	private async checkFriendsEntityAndCreateIfEmpty(ownerID: Types.ObjectId) {
		const friendsEntity = await this.friendModel.findOne({ ownerID });

		if (!friendsEntity) {
			const user = await this.usersService.getUserByID(ownerID);

			if (!user) {
				throw new NotFoundException('Пользователь не найден');
			}

			await this.createFriendsEntity(ownerID);
		}
	}

	private async createFriendsEntity(ownerID: Types.ObjectId) {
		const newFriendEntity = new this.friendModel({
			ownerID,
		});

		return newFriendEntity.save();
	}

	async getFriendsEntity(ownerID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });
		return friendsEntity;
	}

	/** Если сущности друзей нет, то создает новую для пользователя */
	async getFriendsListByOwnerID(ownerID: Types.ObjectId, username: User['username'] = '') {
		await this.checkFriendsEntityAndCreateIfEmpty(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		const populatedFriendsEntity = await friendsEntity.populate<{ friends: PublicUser[] }>({
			path: 'friends',
			select: 'firstName username avatar',
			model: 'User', // ОБЯЗАТЕЛЬНО указывать модель при populate
		});

		const leanFriendsEntity = populatedFriendsEntity.toObject<{ friends: PublicUser[] }>();

		const filteredFriends = leanFriendsEntity.friends.filter((friend) =>
			new RegExp(username, 'i').test(friend.username),
		);

		const friendsListWithFriendsStatus = filteredFriends.map((friend) => ({
			...friend,
			friendStatus: 'friend',
		}));

		return formatResponse(friendsListWithFriendsStatus, 'Список получен успешно');
	}

	async getPersonalIncomingFriendsRequests(ownerID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		console.log({ friendsEntity });

		const populatedFriends = await friendsEntity.populate<{
			incomingRequestsUserIDs: PublicUser[];
		}>({
			path: 'incomingRequestsUserIDs',
			select: '_id firstName username avatar',
			model: 'User', // ОБЯЗАТЕЛЬНО указывать модель при populate
		});

		const leanFriendsEntity = populatedFriends.toObject<{
			incomingRequestsUserIDs: PublicUser[];
		}>();

		const incomingRequestsWithFriendStatus = leanFriendsEntity.incomingRequestsUserIDs.map(
			(request) => ({
				...request,
				friendStatus: 'pendingAcceptance',
			}),
		);

		return formatResponse(incomingRequestsWithFriendStatus, 'Запросы успешно получены');
	}

	async getPersonalOutgoingFriendsRequests(ownerID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(ownerID);

		const friendsEntity = await this.friendModel.findOne({ ownerID });

		const populatedFriends = await friendsEntity.populate<{
			outgoingRequestsUserIDs: PublicUser[];
		}>({
			path: 'outgoingRequestsUserIDs',
			select: '_id firstName username avatar',
			model: 'User', // ОБЯЗАТЕЛЬНО указывать модель при populate
		});

		const leanFriendsEntity = populatedFriends.toObject<{
			outgoingRequestsUserIDs: PublicUser[];
		}>();

		// TODO можно вынести в функцию
		const outgoingRequestsWithFriendStatus = leanFriendsEntity.outgoingRequestsUserIDs.map(
			(request) => ({
				...request,
				friendStatus: 'sent',
			}),
		);

		return formatResponse(outgoingRequestsWithFriendStatus, 'Запросы успешно получены');
	}

	async sendFriendsRequest(senderID: Types.ObjectId, recipientID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(senderID);
		await this.checkFriendsEntityAndCreateIfEmpty(recipientID);

		const senderFriendsEntity = await this.friendModel.findOne({ ownerID: senderID });

		if (recipientID === senderID) {
			throw new BadRequestException(
				'Вы не можете добавить в друзья самого себя! Как вы вообще это сделали? :)',
			);
		}

		if (senderFriendsEntity.incomingRequestsUserIDs.includes(recipientID)) {
			return this.acceptFriendsRequest(senderID, recipientID);
		}

		if (senderFriendsEntity.friends.includes(recipientID)) {
			throw new BadRequestException('Этот пользователь уже у вас в друзьях');
		}

		// TODO если пользователю уже отправляли запрос -> уведомлять об этом
		await this.friendModel.updateOne(
			{ ownerID: senderID },
			{ $addToSet: { outgoingRequestsUserIDs: recipientID } },
		);

		await this.friendModel.updateOne(
			{ ownerID: recipientID },
			{ $addToSet: { incomingRequestsUserIDs: senderID } },
		);

		return formatResponse(null, 'Запрос успешно отправлен');
	}

	async acceptFriendsRequest(recipientID: Types.ObjectId, senderID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(recipientID);
		await this.checkFriendsEntityAndCreateIfEmpty(senderID);

		const recipientUpdateResult = await this.friendModel.updateOne(
			{
				ownerID: recipientID,
				incomingRequestsUserIDs: senderID,
			},
			{
				$addToSet: { friends: senderID },
				$pull: { incomingRequestsUserIDs: senderID },
			},
		);

		if (recipientUpdateResult.modifiedCount === 0) {
			throw new BadRequestException('Заявка на добавление в друзья не найдена');
		}

		await this.friendModel.updateOne(
			{
				ownerID: senderID,
				outgoingRequestsUserIDs: recipientID,
			},
			{
				$addToSet: { friends: recipientID },
				$pull: { outgoingRequestsUserIDs: recipientID },
			},
		);

		return formatResponse(null, 'Заявка в друзья успешно принята!');
	}

	async deleteFriend(ownerID: Types.ObjectId, friendID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(ownerID);
		await this.checkFriendsEntityAndCreateIfEmpty(friendID);

		await this.friendModel.updateOne({ ownerID }, { $pull: { friends: friendID } });

		await this.friendModel.updateOne({ ownerID: friendID }, { $pull: { friends: ownerID } });

		// TODO эта ошибка никогда не выбрасывается, разобраться
		// if (!result.modifiedCount) {
		// 	throw new BadRequestException('Такой пользователь не найден среди ваших друзей');
		// }

		return formatResponse(null, 'Друг успешно удален');
	}

	async declineFriendsRequest(recipientID: Types.ObjectId, senderID: Types.ObjectId) {
		await this.checkFriendsEntityAndCreateIfEmpty(recipientID);
		await this.checkFriendsEntityAndCreateIfEmpty(senderID);

		await this.friendModel.updateOne(
			{ ownerID: recipientID },
			{ $pull: { incomingRequestsUserIDs: senderID } },
		);

		await this.friendModel.updateOne(
			{ ownerID: senderID },
			{ $pull: { outgoingRequestsUserIDs: recipientID } },
		);

		return formatResponse(null, 'Запрос успешно отклонен');
	}
}
