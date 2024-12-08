import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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

	async init(userID: Types.ObjectId): Promise<{ name: string }> {
		const user = await this.usersService.getUserByID(userID);
		return { name: user.name };
	}

	async login(userDto: LoginDto) {
		const user = await this.validateUser(userDto);
		return this.generateToken(user);
	}

	async registration(userDto: CreateUserDto) {
		const isEmailExist = await this.usersService.getUserByEmail(userDto.email);
		const isNicknameExist = await this.usersService.getUserByNickname(userDto.nickname);

		if (isEmailExist) {
			throw new HttpException(
				'Пользователь с таким email уже существует',
				HttpStatus.BAD_REQUEST,
			);
		}

		if (isNicknameExist) {
			throw new HttpException(
				'Пользователь с таким nickname уже существует',
				HttpStatus.BAD_REQUEST,
			);
		}

		const hashPassword = await bcrypt.hash(userDto.password, 5);
		const user = await this.usersService.createUser({ ...userDto, password: hashPassword });

		return this.generateToken(user);
	}

	private async generateToken(user: User) {
		const payload = { _id: user._id };

		return {
			token: this.jwtService.sign(payload),
		};
	}

	private async validateUser(userDto: LoginDto) {
		const user = await this.usersService.getUserByEmail(userDto.email);
		const isPasswordEquals = await bcrypt.compare(userDto.password, user.password);

		if (user && isPasswordEquals) {
			return user;
		}

		throw new UnauthorizedException({ message: 'Некорректный email или пароль' });
	}
}
