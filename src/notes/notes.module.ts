import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';

@Module({
	controllers: [NotesController],
	providers: [NotesService, PrismaService],
	imports: [AuthModule, UsersModule],
})
export class NotesModule {}
