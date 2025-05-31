import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService, PrismaService],
	imports: [forwardRef(() => AuthModule), forwardRef(() => UsersModule)],
	exports: [FriendsService],
})
export class FriendsModule {}
