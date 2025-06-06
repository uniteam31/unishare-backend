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
import { PrismaService } from '../prisma.service';
import { User, UserServiceInfo } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// TODO: вынести в глобальные константы
const S3_SERVICE_ADDRESS = 'https://47c4ee93-f8a4-40fa-a785-9fdb4b1678f9.selstorage.ru';
const S3_BUCKET_NAME = 'unishare';

@Injectable()
export class UsersService {
	constructor(
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
		private awsS3Service: AwsS3Service,
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

		await this.prisma.userServiceInfo.create({
			data: { user: { connect: { id: createdUser.id } }, isInited: false },
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

	async getUserServiceInfo(id: string) {
		return this.prisma.userServiceInfo.findFirst({ where: { userID: id } });
	}

	async updateUserServiceInfo(userID: string, userData: Partial<UserServiceInfo>) {
		return this.prisma.userServiceInfo.update({ where: { userID }, data: userData });
	}

	async getUserSpacesIDs(id: string) {
		const spaces = await this.prisma.space.findMany({
			where: { OR: [{ ownerID: id }, { members: { some: { userID: id } } }] },
		});

		return spaces.map((space) => space.id);
	}

	async getUserSpaces(id: string) {
		const spaces = await this.prisma.space.findMany({
			where: { members: { some: { userID: id } } },
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

		/** Поднимаю пользователя из ответа на уровень выше и убираю лишние поля, теперь в members лежит просто массив пользователей */
		return spaces.map((space) => ({
			...space,
			members: [...space.members.map((member) => member.user)],
		}));
	}

	// TODO: refactoring
	// TODO: взять friendStatus из БД
	async getUsersByUsernameWithFriendStatus(userID: string, username = '') {
		const foundedUsers = await this.prisma.user.findMany({
			where: { NOT: { id: userID }, username: { contains: username, mode: 'insensitive' } },
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

	// TODO: учитывая новый способ работы с S3 через подписанные ссылки, нужно обновить метод
	async updateUserAvatar(userID: string, avatar: Express.Multer.File) {
		const filename = await bcrypt
			.hash(avatar.originalname, 2)
			.then((hash) => `${hash}_${avatar.originalname}`);

		/** Слеш используется для выставления структуры папок в s3, удаляем его из имени файла */
		const filteredFilename = filename.split('/').join('');

		const command = new PutObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: filteredFilename,
			Body: avatar.buffer,
			ContentType: avatar.mimetype,
		});

		await this.awsS3Service.s3Client.send(command);

		const updatedUser = await this.prisma.user.update({
			where: { id: userID },
			data: { avatar: `${S3_SERVICE_ADDRESS}/${filteredFilename}` },
		});

		return {
			avatar: updatedUser.avatar,
		};
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
