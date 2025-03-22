import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpacesService } from './spaces.service';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { CreateSpaceDto } from './dto/create-space-dto';
import { SpaceAccessGuard } from './space-access.guard';

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
}
