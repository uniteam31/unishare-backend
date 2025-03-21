import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { formatResponse } from '../common/utils/response.util';
import { plainToInstance } from 'class-transformer';
import { PublicFriendDto } from './dto/public-friend-dto';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
	constructor(private friendsService: FriendsService) {}

	// TODO вернуть поиск
	@Get('list')
	async getUserFriendsListWithFriendStatus(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		const friendsIDs = await this.friendsService.getUserFriendsWithFriendStatus(ownerID);

		return formatResponse(friendsIDs, 'Друзья получены');
	}

	@Get('incoming')
	async getUserIncomingFriendsRequesters(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		const incomingRequesters =
			await this.friendsService.getUserIncomingFriendsRequesters(ownerID);

		return formatResponse(
			plainToInstance(PublicFriendDto, incomingRequesters, { excludeExtraneousValues: true }),
			'Входящие заявки получены',
		);
	}

	@Get('outgoing')
	async getUserOutgoingFriendsRequesters(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user.id;

		const outgoingRequests =
			await this.friendsService.getUserOutgoingFriendsRequesters(ownerID);

		return formatResponse(
			plainToInstance(PublicFriendDto, outgoingRequests, { excludeExtraneousValues: true }),
			'Исходящие заявки получены',
		);
	}

	@Post('add/:toUserID')
	sendFriendsRequest(@Request() req: IAuthenticatedRequest, @Param('toUserID') toUserID: string) {
		const fromUserID = req.user.id;

		return this.friendsService.sendFriendsRequest(fromUserID, toUserID);
	}

	@Post('delete/:friendID')
	deleteFriend(@Request() req: IAuthenticatedRequest, @Param('friendID') friendID: string) {
		const ownerID = req.user.id;

		return this.friendsService.deleteFriend(ownerID, friendID);
	}

	@Post('accept/:fromUserID')
	acceptFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('fromUserID') fromUserID: string,
	) {
		const toUserID = req.user.id;

		return this.friendsService.acceptFriendsRequest(toUserID, fromUserID);
	}

	@Post('decline/:fromUserID')
	declineFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('fromUserID') fromUserID: string,
	) {
		const toUserID = req.user.id;

		return this.friendsService.declineFriendsRequest(toUserID, fromUserID);
	}

	@Post('cancel/:fromUserID')
	cancelFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('fromUserID') fromUserID: string,
	) {
		const toUserID = req.user.id;

		/** Просто меняю местами агрументы */
		return this.friendsService.declineFriendsRequest(fromUserID, toUserID);
	}
}
