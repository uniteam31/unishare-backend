import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.schema';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get('')
	getUsersByUsernameWithFriendStatus(
		@Query() query: { username: User['username'] },
		@Request() req: IAuthenticatedRequest,
	) {
		const { username } = query;
		const ownerID = req.user._id;

		return this.usersService.getUsersByUsernameWithFriendStatus(ownerID, username);
	}
}
