import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UploadFileDto } from './dto/upload-file-dto';
import { UpdateFileParentDto } from './dto/update-file-parent-dto';
import { AwsS3Service } from '../aws-s3/aws-s3.service';

// TODO: вынести в глобальные константы
const S3_SERVICE_ADDRESS = 'https://47c4ee93-f8a4-40fa-a785-9fdb4b1678f9.selstorage.ru';
const S3_BUCKET_NAME = 'unishare';

@Injectable()
export class FilesService {
	constructor(
		private awsS3Service: AwsS3Service,
		private prisma: PrismaService,
	) {}

	async getSignedPutFileUrl(userID: string, spaceID: string, uploadFileDto: UploadFileDto) {
		const { name, type, parentID } = uploadFileDto;

		const filename = await bcrypt.hash(name, 2).then((hash) => hash + '_' + name);
		const filteredFilename = filename.split('/').join('');

		const command = new PutObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: filteredFilename,
			ContentType: type,
		});

		const data: Prisma.FileCreateInput = {
			space: { connect: { id: spaceID } },
			owner: { connect: { id: userID } },
			name: filename,
			type: type,
		};

		if (parentID) {
			data.parent = { connect: { id: parentID } };
		}

		await this.prisma.file.create({
			data,
		});

		return await getSignedUrl(this.awsS3Service.s3Client, command, { expiresIn: 60 });
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
