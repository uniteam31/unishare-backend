import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserAuthenticationDataDto {
	@Expose()
	@IsOptional()
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректная почта' })
	readonly email: string;

	@Expose()
	@IsOptional()
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректная почта' })
	readonly educationalEmail: string;
}
