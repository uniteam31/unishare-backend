import { Request } from 'express';
import { TJwtPayload } from './auth.types';
import { Types } from 'mongoose';

/** Кастомный интерфейс для типизации Express Request с `user`. */
export interface IAuthenticatedRequest extends Request {
	user?: TJwtPayload; // Опциональное поле user с типами JwtPayload
	currentSpaceID?: Types.ObjectId;
}
