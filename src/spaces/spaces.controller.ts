import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpacesService } from './spaces.service';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { CreateSpaceDto } from './dto/create-space-dto';

@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
	constructor(private readonly spacesService: SpacesService) {}

	@Get('user')
	async getUserSpaces(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		const spaces = await this.spacesService.getUserSpaces(ownerID);

		return formatResponse(spaces, 'Пространства успешно получены');
	}

	@Post()
	async CreateSpace(@Request() req: IAuthenticatedRequest, @Body() body: CreateSpaceDto) {
		const creatorID = req.user._id;

		const createdSpace = await this.spacesService.createSpace(creatorID, body);

		return formatResponse(createdSpace, 'Пространство успешно создано');
	}
}
