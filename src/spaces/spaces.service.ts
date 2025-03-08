import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Space } from './space.schema';
import { CreateSpaceDto } from './dto/create-space-dto';

@Injectable()
export class SpacesService {
	constructor(@InjectModel(Space.name) private spaceModel: Model<Space>) {}

	async createSpace(userID: Types.ObjectId, body: CreateSpaceDto) {
		const createdSpace = await this.spaceModel.create({
			ownerID: userID,
			membersIDs: [userID],
			name: body.name,
		});

		return createdSpace;
	}

	async getUserSpaces(userID: Types.ObjectId): Promise<Space[]> {
		const spacesIDs = await this.spaceModel.find({ membersIDs: userID });

		// TODO populate
		return spacesIDs;
		// .populate('ownerID', '_id username avatar', 'User')
		// .populate('membersIDs', '_id username avatar', 'User')
		// .populate('editorsIDs', '_id username avatar', 'User')
		// .exec();
	}
}
