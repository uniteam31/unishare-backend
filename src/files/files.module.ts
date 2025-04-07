import { forwardRef, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';
import { AwsS3Module } from '../aws-s3/aws-s3.module';

@Module({
	controllers: [FilesController],
	providers: [FilesService, PrismaService],
	imports: [forwardRef(() => AuthModule), UsersModule, AwsS3Module],
})
export class FilesModule {}
