import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** Пока что не используется */
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	getUsers() {
		// return this.usersService.getAllUsers();
		return null;
	}
}
