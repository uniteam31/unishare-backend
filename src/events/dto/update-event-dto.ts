import { IsOptional, Length, IsString, IsISO8601 } from 'class-validator';

export class UpdateEventDto {
	/** Simple event */
	@IsOptional()
	@Length(1, 32, { message: 'Название должно быть от 2 до 32 символов' })
	readonly title?: string;

	@IsString({ message: 'Поле startTime должно быть строкой' })
	@IsISO8601(
		{ strict: true },
		{ message: 'Поле startTime должно быть в формате ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)' },
	)
	readonly startTime: string;

	@IsOptional()
	@IsISO8601(
		{ strict: true },
		{ message: 'Поле endTime должно быть в формате ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)' },
	)
	readonly endTime?: string;

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
