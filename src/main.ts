import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const start = async () => {
	const PORT = process.env.PORT || 8000;
	const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.enableCors({
		origin: CLIENT_URL,
		credentials: true,
	});

	await app.listen(PORT, () => console.log('Server is running on PORT ' + PORT));
};

start().finally();
