import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Space } from './space.schema';
import { CreateSpaceDto } from './dto/create-space-dto';
import { FriendsService } from '../friends/friends.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SpacesService {
	constructor(
		@InjectModel(Space.name) private spaceModel: Model<Space>,
		@Inject(forwardRef(() => FriendsService)) private friendsService: FriendsService,
		@Inject(forwardRef(() => UsersService)) private usersService: UsersService,
	) {}

	async createSpace(userID: Types.ObjectId, body: CreateSpaceDto) {
		const objectedMembersIDs = body.membersIDs.map((id) => new Types.ObjectId(id));

		const creatorIDFriendsEntity = await this.friendsService.getFriendsEntity(userID);

		// Преобразуем friends в Set строк
		const friendsSet = new Set(
			creatorIDFriendsEntity.friends.map((friend) => friend.toString()),
		);

		for (const memberID of objectedMembersIDs) {
			if (!friendsSet.has(memberID.toString())) {
				throw new NotFoundException(
					'Вы не можете добавить не вашего друга в пространство без приглашения',
				);
			}
		}

		const createdSpace = await this.spaceModel.create({
			ownerID: userID,
			membersIDs: [userID, ...objectedMembersIDs],
			name: body.name,
		});

		this.usersService.addSpaceIDToUser(userID, createdSpace._id).finally();

		for (const memberID of objectedMembersIDs) {
			this.usersService.addSpaceIDToUser(memberID, createdSpace._id).finally();
		}

		return createdSpace;
	}
}
