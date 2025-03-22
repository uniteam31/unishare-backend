import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space-dto';
import { FriendsService } from '../friends/friends.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpacesService {
	constructor(
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
		private prisma: PrismaService,
	) {}

	async createSpace(userID: string, body: CreateSpaceDto) {
		const creatorFriends = await this.friendsService.getUserFriendsIDs(userID);
		const creatorServiceInfo = await this.usersService.getUserServiceInfo(userID);

		// Преобразуем friends в Set строк
		const friendsSet = new Set(creatorFriends.map((friend) => friend.toString()));

		for (const memberID of body.membersIDs) {
			if (!friendsSet.has(memberID)) {
				throw new NotFoundException(
					'Вы не можете добавить не вашего друга в пространство без приглашения',
				);
			}
		}

		/** Добавляем самого себя в участники */
		body.membersIDs.push(userID);

		const createdSpace = await this.prisma.space.create({
			data: {
				name: body.name,
				ownerID: userID,
				type: 'PUBLIC',
				members: {
					create: body.membersIDs.map((memberID) => ({
						userID: memberID,
					})),
				},
			},
		});

		/** При создании первого пространства пользователь будет инициализирован */
		if (!creatorServiceInfo.isInited) {
			await this.usersService.updateUserServiceInfo(userID, { isInited: true });
		}

		return createdSpace;
	}

	async getCurrentSpaceInfo(spaceID: string) {
		return this.prisma.space.findFirst({ where: { id: spaceID } });
	}
}
