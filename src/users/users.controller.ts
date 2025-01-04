import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	// @Request() req <- вытаскиваем данные после JwtAuthGuard
	getUsers() {
		return this.usersService.getAllUsers();
	}
}
