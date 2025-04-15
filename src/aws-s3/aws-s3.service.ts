import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import * as process from 'node:process';

/**
 * @description Сервис для работы с s3 хранилищем
 * */
@Injectable()
export class AwsS3Service {
	s3Client: S3Client;

	constructor() {
		this.s3Client = new S3Client({
			region: 'us-east-1',
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY,
				secretAccessKey: process.env.S3_SECRET_KEY,
			},
			endpoint: process.env.S3_ENDPOINT_URL,
		});
	}
}
