import { BadRequestException, Injectable } from '@nestjs/common';
import { formatResponse } from '../common/utils/response.util';
import { PrismaService } from '../prisma.service';
import type { User, Prisma, FriendRequest } from '@prisma/client';

export type FriendsWithUsers = Prisma.FriendsGetPayload<{
	include: { senderUser: true; accepterUser: true };
}>;

export type FriendRequestWithUsers = Prisma.FriendRequestGetPayload<{
	include: { fromUser: true; toUser: true };
}>;

@Injectable()
export class FriendsService {
	constructor(private prisma: PrismaService) {}

	private getFriendFromRelationship(friend: FriendsWithUsers, userID: string): User {
		return friend.accepterUserID === userID ? friend.senderUser : friend.accepterUser;
	}

	private getRequesterFromUser(friend: FriendRequestWithUsers, userID: string): User {
		return friend.toUserID === userID ? friend.fromUser : friend.toUser;
	}

	private async getFriends(userID: string): Promise<User[]> {
		const friends = await this.prisma.friends.findMany({
			where: {
				OR: [{ accepterUserID: userID }, { senderUserID: userID }],
			},
			include: {
				senderUser: true,
				accepterUser: true,
			},
		});

		return friends.map((friend) => this.getFriendFromRelationship(friend, userID));
	}

	private async getIncomingFriendRequesters(userID: string): Promise<User[]> {
		const incomingRequests = await this.prisma.friendRequest.findMany({
			where: { toUserID: userID },
			include: {
				fromUser: true,
				toUser: true,
			},
		});

		return incomingRequests.map((request) => this.getRequesterFromUser(request, userID));
	}

	private async getOutgoingFriendRequesters(userID: string): Promise<User[]> {
		const outgoingRequests = await this.prisma.friendRequest.findMany({
			where: { fromUserID: userID },
			include: {
				fromUser: true,
				toUser: true,
			},
		});

		return outgoingRequests.map((request) => this.getRequesterFromUser(request, userID));
	}

	private async getFriendRequestBetweenUsers(
		fromUserID: string,
		toUserID: string,
	): Promise<FriendRequest> {
		return this.prisma.friendRequest.findFirst({
			where: {
				OR: [
					{ AND: [{ fromUserID }, { toUserID }] },
					{ AND: [{ fromUserID: toUserID }, { toUserID: fromUserID }] },
				],
			},
		});
	}

	async getUserFriendsIDs(userID: string): Promise<string[]> {
		const friendsList = await this.getFriends(userID);

		return friendsList.map((friend) => friend.id);
	}

	async getUserFriendsWithFriendStatus(userID: string) {
		const friendsList = await this.getFriends(userID);

		return friendsList.map((friend) => ({ ...friend, friendStatus: 'friend' }));
	}

	async getUserIncomingFriendsRequesters(userID: string): Promise<User[]> {
		const incomingFriendsRequests = await this.getIncomingFriendRequesters(userID);

		return incomingFriendsRequests.map((request) => ({
			...request,
			friendStatus: 'pendingAcceptance',
		}));
	}

	async getUserOutgoingFriendsRequesters(userID: string): Promise<User[]> {
		const outgoingFriendsRequests = await this.getOutgoingFriendRequesters(userID);

		return outgoingFriendsRequests.map((request) => ({ ...request, friendStatus: 'sent' }));
	}

	async sendFriendsRequest(fromUserID: string, toUserID: string) {
		/** проверяем, существует ли уже запрос на дружбу в любом направлении */
		const existingRequest = await this.getFriendRequestBetweenUsers(fromUserID, toUserID);

		if (existingRequest) {
			throw new BadRequestException('Запрос на дружбу уже существует');
		}

		await this.prisma.friendRequest.create({
			data: {
				fromUserID,
				toUserID,
			},
		});

		return formatResponse(null, 'Запрос успешно отправлен');
	}

	async acceptFriendsRequest(toUserID: string, fromUserID: string) {
		const request = await this.getFriendRequestBetweenUsers(fromUserID, toUserID);

		if (!request) {
			throw new BadRequestException('Заявка на добавление в друзья не найдена');
		}

		if (request.fromUserID !== fromUserID || request.toUserID !== toUserID) {
			throw new BadRequestException('Вы не можете принять эту заявку');
		}

		await this.prisma.friendRequest.deleteMany({
			where: {
				OR: [{ AND: [{ fromUserID }, { toUserID }] }],
			},
		});

		await this.prisma.friends.create({
			data: { senderUserID: fromUserID, accepterUserID: toUserID },
		});

		return formatResponse(null, 'Заявка в друзья успешно принята!');
	}

	async deleteFriend(userID: string, friendID: string) {
		await this.prisma.friends.deleteMany({
			where: {
				OR: [
					{ AND: [{ senderUserID: userID }, { accepterUserID: friendID }] },
					{ AND: [{ senderUserID: friendID }, { accepterUserID: userID }] },
				],
			},
		});

		return formatResponse(null, 'Друг успешно удален');
	}

	async declineFriendsRequest(toUserID: string, fromUserID: string) {
		await this.prisma.friendRequest.deleteMany({
			where: {
				OR: [
					{ AND: [{ fromUserID }, { toUserID }] },
					{ AND: [{ fromUserID: toUserID }, { toUserID: fromUserID }] },
				],
			},
		});

		return formatResponse(null, 'Запрос успешно отклонен');
	}
}
