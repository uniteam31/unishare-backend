import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [
		/** Регистрация схемы в NestJS и связывание с MongoDB */
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
})
export class UsersModule {}
