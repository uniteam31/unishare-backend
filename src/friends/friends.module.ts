import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from './friend.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	imports: [
		MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
		forwardRef(() => AuthModule),
		forwardRef(() => UsersModule),
	],
	exports: [FriendsService],
})
export class FriendsModule {}
