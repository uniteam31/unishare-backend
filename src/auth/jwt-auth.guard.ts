import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TJwtPayload } from './types/auth.types';
import { Types } from 'mongoose';

/** Если возвращает false, то доступ запрещен, иначе разрешен и выставляет в req информацию о пользователе и пространствах */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		try {
			const authHeader = req.headers.authorization;

			const bearer = authHeader.split(' ')[0];
			const token = authHeader.split(' ')[1];

			if (bearer !== 'Bearer' || !token) {
				throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
			}

			/** Расшифровываю информацию из jwt токена */
			const decodedToken = this.jwtService.verify<TJwtPayload>(token);
			decodedToken._id = new Types.ObjectId(decodedToken._id);

			/** Кладу информацию для работы с endpoints в поле user */
			req.user = decodedToken;

			/** Получаю информацию о текущем пространстве из куки */
			// TODO сделать импорт из shared-toolkit
			const currentSpaceID = req.cookies['currentSpaceID'];
			const isValidObjectIDString = Types.ObjectId.isValid(currentSpaceID);

			if (isValidObjectIDString) {
				req.currentSpaceID = new Types.ObjectId(currentSpaceID);
			}

			return true;
		} catch (e) {
			console.error(e);
			throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
		}
	}
}
