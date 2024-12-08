import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TJwtPayload } from './types/auth.types';

/** Если возвращает false, то доступ запрещен, иначе разрешен */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private userService: UsersService,
	) {}

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

			/** Кладу информацию для работы с endpoints в поле user */
			req.user = decodedToken;

			return true;
		} catch (e) {
			console.error(e);
			throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
		}
	}
}
