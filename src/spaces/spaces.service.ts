import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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

		if (!creatorServiceInfo) {
			await this.prisma.userServiceInfo.create({
				data: { user: { connect: { id: userID } }, isInited: false },
			});
		}

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
		const { members, ...space } = await this.prisma.space.findFirst({
			where: { id: spaceID },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								firstName: true,
								lastName: true,
								avatar: true,
							},
						},
					},
				},
			},
		});

		/** Поднимаю после include пользователя на уровень выше */
		return { ...space, members: members.map((member) => member.user) };
	}

	async deleteMemberFromCurrentSpace(spaceID: string, initiatorID: string, userID: string) {
		const currentSpace = await this.getCurrentSpaceInfo(spaceID);

		if (initiatorID === userID) {
			throw new BadRequestException('Вы не можете удалить самого себя');
		}

		// TODO: в будущем проверять по редакторам
		if (currentSpace.ownerID !== initiatorID) {
			throw new ForbiddenException('У вас недостаточно прав для удаления участника');
		}

		if (!currentSpace.members.some((member) => member.id === userID)) {
			throw new NotFoundException('Пользователь не является участником пространства');
		}

		const deletedMember = await this.prisma.spaceMember.delete({
			where: { userID_spaceID: { userID, spaceID } },
		});

		return deletedMember;
	}

	async leaveFromCurrentSpace(spaceID: string, userID: string) {
		await this.prisma.spaceMember.delete({ where: { userID_spaceID: { userID, spaceID } } });
	}
}
