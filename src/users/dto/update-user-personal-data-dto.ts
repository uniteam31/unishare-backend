import { IsOptional, IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserPersonalDataDto {
	@Expose()
	@IsOptional()
	@IsString({ message: 'Имя пользователя должно быть строкой' })
	@Length(3, 20, { message: 'Имя пользователя должно быть от 3 до 20 символов' })
	readonly username: string;

	@Expose()
	@IsOptional()
	@IsString({ message: 'Имя должно быть строкой' })
	@Length(2, 20, { message: 'Имя должно быть от 2 до 20 символов' })
	readonly firstName: string;

	@Expose()
	@IsOptional()
	@IsString({ message: 'Фамилия должна быть строкой' })
	@Length(2, 20, { message: 'Фамилия должна быть от 2 до 20 символов' })
	readonly lastName: string;
}
