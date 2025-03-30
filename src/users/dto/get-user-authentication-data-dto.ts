import { Expose } from 'class-transformer';

export class GetUserAuthenticationDataDto {
	@Expose()
	readonly email: string;

	@Expose()
	readonly educationalEmail: string;
}
