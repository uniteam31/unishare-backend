import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IAuthenticatedRequest } from '../auth/types/authenticated-request.interface';
import { UsersService } from '../users/users.service';

/** Проверяет, что пользователь имеет доступ к пространству, в который посылается запрос */
@Injectable()
export class SpaceAccessGuard implements CanActivate {
	constructor(private userService: UsersService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: IAuthenticatedRequest = context.switchToHttp().getRequest();

		const currentSpaceID = request.currentSpaceID;
		const userID = request.user._id;

		const userSpacesIDs = await this.userService
			.getUserSpacesIDs(userID)
			.then((res) => res.map((id) => String(id)));

		console.log({ userSpacesIDs, currentSpaceID, userID });

		if (!userSpacesIDs.includes(String(currentSpaceID))) {
			throw new ForbiddenException('Вы не имеете доступа к этому пространству');
		}

		return true;
	}
}
