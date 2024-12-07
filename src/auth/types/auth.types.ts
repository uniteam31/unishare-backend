import { Types } from 'mongoose';

/** Интерфейс для декодированной информации из JWT */
export interface TJwtPayload {
	_id: Types.ObjectId;
}
