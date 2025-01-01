import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from './friend.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
	providers: [FriendsService],
	controllers: [FriendsController],
	imports: [
		MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
		AuthModule,
		UsersModule,
	],
})
export class FriendsModule {}
