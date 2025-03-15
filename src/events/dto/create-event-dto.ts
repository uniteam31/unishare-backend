import { IsOptional, Length } from 'class-validator';

export class CreateEventDto {
	/** Simple event */
	@IsOptional()
	@Length(1, 32, { message: 'Название должно быть от 2 до 32 символов' })
	readonly title?: string;

	readonly startTime: string;

	@IsOptional()
	readonly endTime: string;

	@IsOptional()
	readonly description?: string;

	@IsOptional()
	readonly color?: string;

	/** Recursive event */
	@IsOptional()
	readonly interval?: number;

	@IsOptional()
	readonly period?: 'day' | 'week' | 'month' | 'year';

	@IsOptional()
	readonly days?: number[];
}
