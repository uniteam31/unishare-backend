import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	ParseFilePipe,
	Put,
	Query,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { UpdateUserPersonalDataDto } from './dto/update-user-personal-data-dto';
import { UpdateUserAuthenticationDataDto } from './dto/update-user-authentication-data-dto';
import { plainToInstance } from 'class-transformer';
import { PublicFriendDto } from '../friends/dto/public-friend-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUserPersonalDataDto } from './dto/get-user-personal-data-dto';
import { GetUserAuthenticationDataDto } from './dto/get-user-authentication-data-dto';

const REGEX_CORRECT_IMG_TYPES = /(gif|jpe?g|tiff?|png|webp|bmp)$/i;

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get('')
	async getUsersByUsernameWithFriendStatus(
		@Request() req: IAuthenticatedRequest,
		@Query() query: { username: string },
	) {
		const userID = req.user.id;
		const { username } = query;

		const users = await this.usersService.getUsersByUsernameWithFriendStatus(userID, username);

		return formatResponse(
			plainToInstance(PublicFriendDto, users, { excludeExtraneousValues: true }),
			'Список пользователй получен',
		);
	}

	@Get('personalData')
	async getUserPersonalData(@Request() req: IAuthenticatedRequest) {
		const userID = req.user.id;

		const personalData = await this.usersService.getUserByID(userID);

		return formatResponse(
			plainToInstance(GetUserPersonalDataDto, personalData, {
				excludeExtraneousValues: true,
			}),
			'Данные успешно получены',
		);
	}

	@Put('personalData')
	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	async updateUserPersonalData(
		@Body() updateUserPersonalDataDto: UpdateUserPersonalDataDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user.id;

		const updatedPersonaData = await this.usersService.updateUserPersonalData(
			userID,
			updateUserPersonalDataDto,
		);

		return formatResponse(
			plainToInstance(UpdateUserPersonalDataDto, updatedPersonaData, {
				excludeExtraneousValues: true,
			}),
			'Данные успешно обновлены',
		);
	}

	@Put('personalData/avatar')
	@UseInterceptors(FileInterceptor('avatar')) //
	async updateUserAvatar(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({
						// TODO: приходит непонятная ошибка валидации
						fileType: REGEX_CORRECT_IMG_TYPES,
					}),
				],
			}),
		)
		avatar: Express.Multer.File,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user.id;

		const updatedData = await this.usersService.updateUserAvatar(userID, avatar);

		return formatResponse(updatedData, 'Данные успешно обновлены');
	}

	@Get('authenticationData')
	async getUserAuthenticationData(@Request() req: IAuthenticatedRequest) {
		const userID = req.user.id;

		const authenticationData = await this.usersService.getUserByID(userID);

		return formatResponse(
			plainToInstance(GetUserAuthenticationDataDto, authenticationData, {
				excludeExtraneousValues: true,
			}),
			'Данные успешно получены',
		);
	}

	@Put('authenticationData')
	async updateUserAuthenticationData(
		@Body() updateUserAuthenticationDataDto: UpdateUserAuthenticationDataDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user.id;

		const updatedPersonaData = await this.usersService.updateUserAuthenticationData(
			userID,
			updateUserAuthenticationDataDto,
		);

		return formatResponse(updatedPersonaData, 'Данные успешно обновлены');
	}

	// TODO: move to spaces controller?
	@Get('spaces')
	async getUserSpaces(@Request() req: IAuthenticatedRequest) {
		const userID = req.user.id;

		const userSpaces = await this.usersService.getUserSpaces(userID);

		return formatResponse(userSpaces, 'Пространства успешно получены');
	}
}
