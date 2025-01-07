import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const start = async () => {
	const PORT = process.env.PORT || 8000;
	const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.enableCors({
		origin: CLIENT_URL,
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true, // Преобразует данные к типу, указанному в DTO
		}),
	);

	await app.listen(PORT, () => console.log('Server is running on PORT ' + PORT));
};

start().finally();
