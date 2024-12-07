import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const start = async () => {
	const PORT = process.env.PORT || 8080;
	const app = await NestFactory.create(AppModule);

	await app.listen(PORT, () => console.log('Server is running on PORT ' + PORT));
};

start().finally();
