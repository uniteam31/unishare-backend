import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { EventsModule } from './events/events.module';
import { SpacesModule } from './spaces/spaces.module';
import { PrismaService } from './prisma.service';
import { FilesModule } from './files/files.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';

@Module({
	controllers: [],
	providers: [PrismaService],
	imports: [
		ConfigModule.forRoot({
			envFilePath: `.env`,
		}),
		UsersModule,
		NotesModule,
		AuthModule,
		FriendsModule,
		SpacesModule,
		EventsModule,
		FilesModule,
		AwsS3Module,
	],
})
export class AppModule {}
