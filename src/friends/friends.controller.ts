import {
	BadRequestException,
	Controller,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { Types } from 'mongoose';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
	constructor(private friendsService: FriendsService) {}

	@Post()
	createFriendsEntity(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.friendsService.createFriendsEntity(ownerID);
	}

	@Get('list/:ownerID')
	getFriendsListByOwnerID(@Param('ownerID') ownerID: Types.ObjectId) {
		if (!Types.ObjectId.isValid(ownerID)) {
			throw new BadRequestException('Некорректный ID');
		}

		return this.friendsService.getFriendsListByOwnerID(ownerID);
	}
}
