import {
	BadRequestException,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Request,
	UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { Types } from 'mongoose';
import { User } from '../users/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
	constructor(private friendsService: FriendsService) {}

	@Get('list')
	getPersonalFriendsList(
		@Request() req: IAuthenticatedRequest,
		@Query() query: { username: User['username'] },
	) {
		const ownerID = req.user._id;
		const { username } = query;

		return this.friendsService.getFriendsListByOwnerID(ownerID, username);
	}

	@Get('list/:ownerID')
	getFriendsListByOwnerID(@Param('ownerID') ownerID: string) {
		if (!Types.ObjectId.isValid(ownerID)) {
			throw new BadRequestException('Некорректный ID');
		}

		const objectOwnerID = new Types.ObjectId(ownerID);

		return this.friendsService.getFriendsListByOwnerID(objectOwnerID);
	}

	@Get('incoming')
	getPersonalIncomingFriendsRequests(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.friendsService.getPersonalIncomingFriendsRequests(ownerID);
	}

	@Get('outgoing')
	getPersonalOutgoingFriendsRequests(@Request() req: IAuthenticatedRequest) {
		const ownerID = req.user._id;

		return this.friendsService.getPersonalOutgoingFriendsRequests(ownerID);
	}

	@Post('add/:recipientID')
	sendFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('recipientID') recipientID: string,
	) {
		const senderID = req.user._id;
		const objectRecipientID = new Types.ObjectId(recipientID);

		return this.friendsService.sendFriendsRequest(senderID, objectRecipientID);
	}

	@Post('delete/:friendID')
	deleteFriend(@Request() req: IAuthenticatedRequest, @Param('friendID') friendID: string) {
		const ownerID = req.user._id;
		const objectFriendID = new Types.ObjectId(friendID);

		return this.friendsService.deleteFriend(ownerID, objectFriendID);
	}

	@Post('accept/:senderID')
	acceptFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('senderID') senderID: string,
	) {
		const recipientID = req.user._id;
		const objectSenderID = new Types.ObjectId(senderID);

		return this.friendsService.acceptFriendsRequest(recipientID, objectSenderID);
	}

	@Post('decline/:senderID')
	declineFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('senderID') senderID: string,
	) {
		const recipientID = req.user._id;
		const objectSenderID = new Types.ObjectId(senderID);

		return this.friendsService.declineFriendsRequest(recipientID, objectSenderID);
	}

	@Post('cancel/:senderID')
	cancelFriendsRequest(
		@Request() req: IAuthenticatedRequest,
		@Param('senderID') senderID: string,
	) {
		const recipientID = req.user._id;
		const objectSenderID = new Types.ObjectId(senderID);

		/** Просто меняю местами агрументы */
		return this.friendsService.declineFriendsRequest(objectSenderID, recipientID);
	}
}
