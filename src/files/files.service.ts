import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

	async getSignedPutUrl(uploadFileDto: UploadFileDto) {
		const { name, type } = uploadFileDto;

		const prefixHashedFilename = await bcrypt.hash(name, 2).then((hash) => hash + '_' + name);

		/** Слеш используется для выставления структуры папок в s3, удаляем его из имени файла */
		const filteredPrefixHashedFilename = prefixHashedFilename.split('/').join('');

		const command = new PutObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: filteredPrefixHashedFilename,
			ContentType: type,
		});

		const signedUrl = await getSignedUrl(this.awsS3Service.s3Client, command, {
			expiresIn: 60,
		});

		return {
			signedUrl,
			prefixHashedFilename: filteredPrefixHashedFilename,
		};
	}

	/**
	 * @description Возвращает ссылку на загрузку файла и id из созданной записи в бд
	 * */
	async createUploadFileSession(userID: string, spaceID: string, uploadFileDto: UploadFileDto) {
		const { type, parentID } = uploadFileDto;

		const { signedUrl, prefixHashedFilename } = await this.getSignedPutUrl(uploadFileDto);

		const data: Prisma.FileCreateInput = {
			space: { connect: { id: spaceID } },
			owner: { connect: { id: userID } },
			name: prefixHashedFilename,
			type: type,
			status: 'PENDING',
		};

		if (parentID) {
			data.parent = { connect: { id: parentID } };
		}

		const createdFile = await this.prisma.file.create({
			data,
		});

		return {
			url: signedUrl,
			fileID: createdFile.id,
		};
	}

	/**
	 * @description Подтверждает загрузку файла и выставляет статус в UPLOADED
	 * */
	async confirmUploadFile(fileID: string) {
		const updatedFile = await this.prisma.file.findFirst({ where: { id: fileID } });

		if (!updatedFile) {
			throw new NotFoundException('Такой файл не найден');
		}

		if (updatedFile.status !== 'PENDING') {
			throw new BadRequestException('Файл уже загружен');
		}

		const file = await this.prisma.file.update({
			where: { id: fileID },
			data: { status: 'UPLOADED' },
		});

		return file;
	}

	async getFilesFromSpace(spaceID: string) {
		// Retrieve files associated with the space
		const files = await this.prisma.file.findMany({
			where: { space: { id: spaceID }, OR: [{ status: 'UPLOADED' }, { type: 'folder' }] },
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
