import {
	Body,
	Controller,
	Get,
	Put,
	Query,
	Request,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.schema';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data-dto';
import { UpdateUserAuthenticationDataDto } from './dto/update-user-authentication-data-dto';

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

	@Get('personalData')
	async getUserPersonalData(@Request() req: IAuthenticatedRequest) {
		const userID = req.user._id;

		const personalData = await this.usersService.getUserPersonalData(userID);

		return formatResponse(personalData, 'Данные успешно получены');
	}

	@Put('personalData')
	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	async updateUserPersonalData(
		@Body() updateUserPersonalDataDto: UpdateUserPersonalDataDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user._id;

		const updatedPersonaData = await this.usersService.updateUserPersonalData(
			userID,
			updateUserPersonalDataDto,
		);

		return formatResponse(updatedPersonaData, 'Данные успешно обновлены');
	}

	@Get('authenticationData')
	async getUserAuthenticationData(@Request() req: IAuthenticatedRequest) {
		const userID = req.user._id;

		const personalData = await this.usersService.getUserAuthenticationData(userID);

		return formatResponse(personalData, 'Данные успешно получены');
	}

	@Put('authenticationData')
	async updateUserAuthenticationData(
		@Body() updateUserAuthenticationDataDto: UpdateUserAuthenticationDataDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user._id;

		const updatedPersonaData = await this.usersService.updateUserAuthenticationData(
			userID,
			updateUserAuthenticationDataDto,
		);

		return formatResponse(updatedPersonaData, 'Данные успешно обновлены');
	}

	@Get('spaces')
	async getUserSpaces(@Request() req: IAuthenticatedRequest) {
		const userID = req.user._id;

		const userSpaces = await this.usersService.getUserSpaces(userID);

		return formatResponse(userSpaces, 'Пространства успешно получены');
	}
}
