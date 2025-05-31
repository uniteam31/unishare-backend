import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpacesService } from './spaces.service';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { CreateSpaceDto } from './dto/create-space-dto';
import { SpaceAccessGuard } from './space-access.guard';
import { plainToInstance } from 'class-transformer';
import { PublicUserDto } from '../users/dto/public-user-dto';

@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
	constructor(private readonly spacesService: SpacesService) {}

	@Post()
	async createSpace(@Request() req: IAuthenticatedRequest, @Body() body: CreateSpaceDto) {
		const creatorID = req.user.id;

		const createdSpace = await this.spacesService.createSpace(creatorID, body);

		return formatResponse(createdSpace, 'Пространство успешно создано');
	}

	@UseGuards(SpaceAccessGuard)
	@Get('info')
	async getCurrentSpaceInfo(@Request() req: IAuthenticatedRequest) {
		const currentSpaceID = req.currentSpaceID;

		const spaceInfo = await this.spacesService.getCurrentSpaceInfo(currentSpaceID);

		return formatResponse(spaceInfo, 'Информация о пространстве получена');
	}

	@UseGuards(SpaceAccessGuard)
	@Delete('members/:id')
	async deleteMemberFromCurrentSpace(
		@Request() req: IAuthenticatedRequest,
		@Param('id') userID: string,
	) {
		const currentSpaceID = req.currentSpaceID;
		const initiatorID = req.user.id;

		await this.spacesService.deleteMemberFromCurrentSpace(currentSpaceID, initiatorID, userID);

		return formatResponse(null, 'Пользователь успешно удален');
	}

	@UseGuards(SpaceAccessGuard)
	@Put('members/:id')
	async addMemberToCurrentSpace(
		@Request() req: IAuthenticatedRequest,
		@Param('id') userID: string,
	) {
		const currentSpaceID = req.currentSpaceID;
		const initiatorID = req.user.id;

		const addedMember = await this.spacesService.addMemberToCurrentSpace(
			currentSpaceID,
			initiatorID,
			userID,
		);

		return formatResponse(
			plainToInstance(PublicUserDto, addedMember, { excludeExtraneousValues: true }),
			'Пользователь успешно добавлен',
		);
	}

	@UseGuards(SpaceAccessGuard)
	@Post('leave')
	async leaveFromCurrentSpace(@Request() req: IAuthenticatedRequest) {
		const currentSpaceID = req.currentSpaceID;
		const userID = req.user.id;

		await this.spacesService.leaveFromCurrentSpace(currentSpaceID, userID);

		return formatResponse(null, 'Вы вышли из пространства');
	}
}
