import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректная почта' })
	readonly email: string;

	@IsString({ message: 'Пароль должен быть строкой' })
	@Length(6, 30, { message: 'Пароль должен быть от 6 до 30 символов' })
	readonly password: string;

	@IsString({ message: 'Имя должно быть строкой' })
	@Length(2, 20, { message: 'Имя должно быть от 2 до 20 символов' })
	readonly firstName: string;

	@IsString({ message: 'Имя пользователя должно быть строкой' })
	@Length(3, 20, { message: 'Имя пользователя должно быть от 3 до 20 символов' })
	readonly username: string;
}
