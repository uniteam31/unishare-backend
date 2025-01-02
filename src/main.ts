import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const start = async () => {
	const PORT = process.env.PORT || 8000;
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.enableCors({
		origin: 'http://localhost:3000', // Укажите адрес вашего клиента
		credentials: true, // Если используете куки или заголовок Authorization
	});

	await app.listen(PORT, () => console.log('Server is running on PORT ' + PORT));
};

start().finally();
