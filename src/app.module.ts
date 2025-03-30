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
import { S3Module } from 'nestjs-s3';

@Module({
	controllers: [],
	providers: [PrismaService],
	imports: [
		ConfigModule.forRoot({
			envFilePath: `.env`,
		}),
		S3Module.forRoot({
			config: {
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY,
					secretAccessKey: process.env.S3_SECRET_KEY,
				},
				region: 'us-east-1',
				endpoint: process.env.S3_ENDPOINT_URL,
				forcePathStyle: true,
			},
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
