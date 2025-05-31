import { forwardRef, Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FriendsModule } from '../friends/friends.module';
import { PrismaService } from '../prisma.service';

@Module({
	providers: [SpacesService, PrismaService],
	controllers: [SpacesController],
	imports: [
		forwardRef(() => AuthModule),
		forwardRef(() => UsersModule),
		forwardRef(() => FriendsModule),
	],
	exports: [SpacesService],
})
export class SpacesModule {}
