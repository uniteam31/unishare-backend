import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from '../friends/friends.module';
import { SpacesModule } from '../spaces/spaces.module';
import { PrismaService } from '../prisma.service';

@Module({
	controllers: [UsersController],
	providers: [UsersService, PrismaService],
	imports: [forwardRef(() => AuthModule), FriendsModule, SpacesModule],
	exports: [UsersService],
})
export class UsersModule {}
