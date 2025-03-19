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

		// Преобразуем friends в Set строк
		const friendsSet = new Set(creatorFriends.map((friend) => friend.toString()));

		for (const memberID of body.membersIDs) {
			if (!friendsSet.has(memberID)) {
				throw new NotFoundException(
					'Вы не можете добавить не вашего друга в пространство без приглашения',
				);
			}
		}

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

		return createdSpace;
	}
}
