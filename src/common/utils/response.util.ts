import { ApiResponse } from './response.type';

export function formatResponse<T>(data: T, message: string): ApiResponse<T> {
	return { data, message };
}
