import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectS3, S3 } from 'nestjs-s3';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UploadFileDto } from './dto/upload-file-dto';
import { UpdateFileParentDto } from './dto/update-file-parent-dto';

// TODO: вынести в глобальные константы
const S3_SERVICE_ADDRESS = 'https://47c4ee93-f8a4-40fa-a785-9fdb4b1678f9.selstorage.ru';
const S3_BUCKET_NAME = 'unishare';

@Injectable()
export class FilesService {
	constructor(
		@InjectS3() private readonly s3: S3,
		private prisma: PrismaService,
	) {}

	async uploadFileToSpace(
		userID: string,
		spaceID: string,
		file: Express.Multer.File,
		updateFileDto: UploadFileDto,
	) {
		const filename = await bcrypt
			.hash(file.originalname, 2)
			.then((hash) => hash + '_' + file.originalname);

		const filteredFilename = filename.split('/').join('');

		await this.s3.putObject({
			Bucket: S3_BUCKET_NAME,
			Key: filteredFilename,
			Body: file.buffer,
			ContentType: file.mimetype,
		});

		const data: Prisma.FileCreateInput = {
			space: { connect: { id: spaceID } },
			owner: { connect: { id: userID } },
			name: filename,
			type: file.mimetype,
		};

		if (updateFileDto.parentID) {
			data.parent = { connect: { id: updateFileDto.parentID } };
		}

		await this.prisma.file.create({
			data,
		});

		return { url: `${S3_SERVICE_ADDRESS}/${filteredFilename}` };
	}

	async getFilesFromSpace(spaceID: string) {
		// Retrieve files associated with the space
		const files = await this.prisma.file.findMany({
			where: { space: { id: spaceID } },
			orderBy: { name: 'asc' },
		});

		// Create a map of file id to tree node
		const fileMap = new Map<string, any>();
		files.forEach((file) => {
			const underscoreIndex = file.name.indexOf('_');

			const originalName =
				underscoreIndex !== -1 ? file.name.substring(underscoreIndex + 1) : file.name;

			const filteredFilename = file.name.split('/').join('');

			// TODO: types!!
			fileMap.set(file.id, {
				name: originalName,
				id: file.id,
				url: file.type !== 'folder' && `${S3_SERVICE_ADDRESS}/${filteredFilename}`,
				children: [],
				type: file.type || 'folder',
			});
		});

		// Build tree by linking child nodes to their parent
		const rootNodes: any[] = [];

		files.forEach((file) => {
			const node = fileMap.get(file.id);
			if (file.parentID) {
				const parentNode = fileMap.get(file.parentID);

				if (parentNode) {
					parentNode.children.push(node);
				} else {
					// If parent not found, consider it as a root node
					rootNodes.push(node);
				}
			} else {
				// File without a parent is a root node
				rootNodes.push(node);
			}
		});

		// Final tree structure with a root node
		const tree = {
			name: 'Files',
			id: '',
			children: rootNodes,
			type: 'folder',
		};

		return tree;
	}

	async updateFileParent(spaceID: string, updateFileParentDto: UpdateFileParentDto) {
		const { fileID, parentID: newParentID } = updateFileParentDto;

		const parentFile = await this.prisma.file.findFirst({ where: { id: newParentID } });

		if (parentFile.type !== 'folder') {
			throw new BadRequestException('Вы не можете переместить файл внутрь другого файла');
		}

		const file = await this.prisma.file.update({
			where: { id: fileID, spaceID },
			data: { parent: { connect: { id: newParentID || undefined } } },
		});

		return file;
	}

	async createFolderInSpace(userID: string, spaceID: string, createFolderDto: CreateFolderDto) {
		const { name, parentID } = createFolderDto;

		const data: Prisma.FileCreateInput = {
			space: { connect: { id: spaceID } },
			owner: { connect: { id: userID } },
			name,
			type: 'folder',
		};

		// TODO: проверять, что существует
		if (parentID) {
			data.parent = { connect: { id: parentID } };
		}

		const folder = await this.prisma.file.create({
			data,
		});

		return folder;
	}
}
