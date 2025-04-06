import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { formatResponse } from '../common/utils/response.util';
import { SpaceAccessGuard } from '../spaces/space-access.guard';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UploadFileDto } from './dto/upload-file-dto';
import { UpdateFileParentDto } from './dto/update-file-parent-dto';

@UseGuards(JwtAuthGuard, SpaceAccessGuard)
@Controller('files')
export class FilesController {
	constructor(private filesService: FilesService) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	async uploadFileToSpace(
		@UploadedFile()
		file: Express.Multer.File,
		@Body() uploadFileDto: UploadFileDto,
		@Request() req: IAuthenticatedRequest,
	) {
		const userID = req.user.id;
		const currentSpaceID = req.currentSpaceID;

		const uploadedFile = await this.filesService.uploadFileToSpace(
			userID,
			currentSpaceID,
			file,
			uploadFileDto,
		);

		return formatResponse(uploadedFile, 'Файл успешно загружен');
	}

	@Get()
	async getFilesFromSpace(@Request() req: IAuthenticatedRequest) {
		const currentSpaceID = req.currentSpaceID;

		const filesTree = await this.filesService.getFilesFromSpace(currentSpaceID);

		return formatResponse(filesTree, 'Файлы получены');
	}

	@Put('move')
	async updateFileParent(
		@Request() req: IAuthenticatedRequest,
		@Body() updateFileParentDto: UpdateFileParentDto,
	) {
		const currentSpaceID = req.currentSpaceID;

		const updatedFile = await this.filesService.updateFileParent(
			currentSpaceID,
			updateFileParentDto,
		);

		return formatResponse(updatedFile, 'Файл успешно перемещен');
	}

	@Post('folders')
	async createFolderInSpace(
		@Request() req: IAuthenticatedRequest,
		@Body() createFolderDto: CreateFolderDto,
	) {
		const userID = req.user.id;
		const currentSpaceID = req.currentSpaceID;

		const folder = await this.filesService.createFolderInSpace(
			userID,
			currentSpaceID,
			createFolderDto,
		);

		return formatResponse(folder, 'Папка создана');
	}
}
