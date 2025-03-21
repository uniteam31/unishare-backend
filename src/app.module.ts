import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { EventsModule } from './events/events.module';
import { SpacesModule } from './spaces/spaces.module';
import * as process from 'node:process';
import { PrismaService } from './prisma.service';

@Module({
	controllers: [],
	providers: [PrismaService],
	imports: [
		ConfigModule.forRoot({
			envFilePath: `.${process.env.NODE_ENV}.env`,
		}),
		UsersModule,
		NotesModule,
		AuthModule,
		FriendsModule,
		SpacesModule,
		EventsModule,
	],
})
export class AppModule {}
