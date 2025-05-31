import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from '../common/utils/response.type';
import { formatResponse } from '../common/utils/response.util';
import { User, Space } from '@prisma/client';

type TUserInitialData = {
	firstName: User['firstName'];
	username: User['username'];
	isInited: boolean;
};

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async init(userID: string): Promise<ApiResponse<TUserInitialData>> {
		const user = await this.usersService.getUserByID(userID);
		const userServiceInfo = await this.usersService.getUserServiceInfo(userID);

		const userSpacesIDs = await this.usersService.getUserSpacesIDs(userID);

		return formatResponse(
			{
				id: userID,
				username: user.username,
				firstName: user.firstName,
				avatar: user.avatar,
				isInited: userServiceInfo?.isInited,
				spacesIDs: userSpacesIDs,
			},
			'Пользователь инициализирован',
		);
	}

	async login(userDto: LoginDto): Promise<ApiResponse<string>> {
		const user = await this.validateUser(userDto);
		const token = await this.generateToken(user);

		return formatResponse(token, 'Вы успешно вошли в аккаунт');
	}

	async registration(userDto: CreateUserDto): Promise<ApiResponse<string>> {
		const isEmailExist = await this.usersService.getUserByEmail(userDto.email);
		const isUsernameExist = await this.usersService.getUserByUsername(userDto.username);

		if (isEmailExist) {
			throw new HttpException(
				'Пользователь с таким email уже существует',
				HttpStatus.BAD_REQUEST,
			);
		}

		if (isUsernameExist) {
			throw new HttpException(
				'Пользователь с таким username уже существует',
				HttpStatus.BAD_REQUEST,
			);
		}

		const hashPassword = await bcrypt.hash(userDto.password, 5);
		const user = await this.usersService.createUser({ ...userDto, password: hashPassword });

		const token = await this.generateToken(user);

		return formatResponse(token, 'Пользователь успешно зарегистрирован');
	}

	private async generateToken(user: User): Promise<string> {
		const payload = { id: user.id };

		return this.jwtService.sign(payload);
	}

	private async validateUser(userDto: LoginDto) {
		const user = await this.usersService.getUserByEmail(userDto.email);

		if (!user) {
			throw new BadRequestException({ message: 'Не удается найти такого пользователя' });
		}

		const isPasswordEquals = await bcrypt.compare(userDto.password, user.password);

		if (user && isPasswordEquals) {
			return user;
		}

		throw new BadRequestException({ message: 'Некорректный email или пароль' });
	}
}
