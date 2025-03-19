import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { FriendsService } from '../friends/friends.service';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data-dto';
import { UpdateUserAuthenticationDataDto } from './dto/update-user-authentication-data-dto';
import { SpacesService } from '../spaces/spaces.service';
import { PrismaService } from '../prisma.service';
import { Space, User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
		@Inject(forwardRef(() => SpacesService)) private spacesService: SpacesService,
		private prisma: PrismaService,
	) {}

	private async updateUserData(userID: string, userData: Partial<User>) {
		const updatedUser = await this.prisma.user.update({
			where: { id: userID },
			data: userData,
		});

		return updatedUser;
	}

	async createUser(createUserDto: CreateUserDto) {
		const createdUser = await this.prisma.user.create({
			data: {
				...createUserDto,
			},
		});

		/** У каждого пользователя при регистрации создается личное пространство под его именем */
		await this.prisma.space.create({
			data: {
				name: createdUser.username,
				ownerID: createdUser.id,
				type: 'PERSONAL',
				members: { create: { userID: createdUser.id } },
			},
		});

		return createdUser;
	}

	async getUserByEmail(email: string) {
		return this.prisma.user.findFirst({ where: { email } });
	}

	async getUserByUsername(username: string) {
		return this.prisma.user.findFirst({ where: { username } });
	}

	async getUserByID(id: string) {
		return this.prisma.user.findFirst({ where: { id } });
	}

	async getUserPersonalSpace(id: string): Promise<Space> {
		return this.prisma.space.findFirst({
			where: { ownerID: id, type: 'PERSONAL' },
		});
	}

	async getUserSpacesIDs(id: string) {
		const spaces = await this.prisma.space.findMany({ where: { ownerID: id } });

		return spaces.map((space) => space.id);
	}

	async getUserSpaces(id: string) {
		return this.prisma.space.findMany({ where: { ownerID: id } });
	}

	// TODO: вернуть поиск по имени пользователя
	// TODO: refactoring
	// TODO: взять friendStatus из БД
	async getUsersByUsernameWithFriendStatus(userID: string) {
		const foundedUsers = await this.prisma.user.findMany({
			where: { NOT: { id: userID } },
		});

		const incomingFriendsRequesters =
			await this.friendsService.getUserIncomingFriendsRequesters(userID);

		const outgoingFriendsRequesters =
			await this.friendsService.getUserOutgoingFriendsRequesters(userID);

		const userFriendsIDs = await this.friendsService.getUserFriendsIDs(userID);

		const users = foundedUsers.map((user) => {
			if (incomingFriendsRequesters.find((incomingUser) => incomingUser.id === user.id)) {
				return {
					...user,
					friendStatus: 'pendingAcceptance',
				};
			}

			if (outgoingFriendsRequesters.some((outgoingUser) => outgoingUser.id === user.id)) {
				return {
					...user,
					friendStatus: 'sent',
				};
			}

			if (userFriendsIDs.includes(user.id)) {
				return {
					...user,
					friendStatus: 'friend',
				};
			}

			return {
				...user,
				friendStatus: null,
			};
		});

		return users;
	}

	async updateUserPersonalData(
		userID: string,
		updateUserPersonalDataDto: UpdateUserPersonalDataDto,
	) {
		if (updateUserPersonalDataDto.username) {
			const candidate = await this.prisma.user.findFirst({
				where: { username: updateUserPersonalDataDto.username },
			});

			if (candidate) {
				throw new BadRequestException(
					'Пользователь с таким именем пользователя уже существует',
				);
			}
		}

		const updatedPersonalData = await this.updateUserData(userID, updateUserPersonalDataDto);

		if (!updatedPersonalData) {
			throw new NotFoundException(
				'Такого пользователя нет или у вас нет прав для редактирования',
			);
		}

		return updatedPersonalData;
	}

	async updateUserAuthenticationData(
		userID: string,
		updateUserAuthenticationDataDto: UpdateUserAuthenticationDataDto,
	) {
		const updatedAuthenticationData = await this.updateUserData(
			userID,
			updateUserAuthenticationDataDto,
		);

		if (!updatedAuthenticationData) {
			throw new NotFoundException(
				'Такого пользователя нет или у вас нет прав для редактирования',
			);
		}

		return updatedAuthenticationData;
	}
}
