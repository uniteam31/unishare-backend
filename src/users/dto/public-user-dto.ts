import { Expose } from 'class-transformer';

export class PublicUserDto {
	@Expose()
	id: string;

	@Expose()
	username: string;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string;

	@Expose()
	avatar: string;
}
