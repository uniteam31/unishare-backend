import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [
		/** Регистрация схемы в NestJS и связывание с MongoDB */
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		forwardRef(() => AuthModule),
		FriendsModule,
	],
	exports: [UsersService],
})
export class UsersModule {}
