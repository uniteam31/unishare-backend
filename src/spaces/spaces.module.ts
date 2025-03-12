import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Space, SpaceSchema } from './space.schema';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
	providers: [SpacesService],
	controllers: [SpacesController],
	imports: [
		MongooseModule.forFeature([{ name: Space.name, schema: SpaceSchema }]),
		forwardRef(() => AuthModule),
		forwardRef(() => UsersModule),
		forwardRef(() => FriendsModule),
	],
	exports: [SpacesService],
})
export class SpacesModule {}
