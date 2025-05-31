import { Expose } from 'class-transformer';

export class GetUserPersonalDataDto {
	@Expose()
	readonly username: string;

	@Expose()
	readonly firstName: string;

	@Expose()
	readonly lastName: string;

	@Expose()
	readonly avatar: string;
}
