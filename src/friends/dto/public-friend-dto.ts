import { PublicUserDto } from '../../users/dto/public-user-dto';
import { Expose } from 'class-transformer';

export class PublicFriendDto extends PublicUserDto {
	@Expose()
	friendStatus: string;
}
