import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserAuthenticationDataDto {
	@IsOptional()
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректная почта' })
	readonly email: string;

	@IsOptional()
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректная почта' })
	readonly educationalEmail: string;
}
