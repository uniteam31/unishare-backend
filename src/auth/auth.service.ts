import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async init(userID: Types.ObjectId): Promise<{ firstName: string; username: string }> {
		const user = await this.usersService.getUserByID(userID);
		return { firstName: user.firstName, username: user.username };
	}

	async login(userDto: LoginDto) {
		const user = await this.validateUser(userDto);
		const token = await this.generateToken(user);

		return {
			data: token,
			message: 'Успешная авторизация',
		};
	}

	async registration(userDto: CreateUserDto) {
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

		return {
			data: token,
			message: 'Успешная регистрация',
		};
	}

	private async generateToken(user: User) {
		const payload = { _id: user._id };

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
