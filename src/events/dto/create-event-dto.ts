export class CreateEventDto {
	/** Simple event */
	readonly title?: string;
	readonly startTime: string;
	readonly endTime?: string;
	readonly description?: string;

	/** Recursive event */
	readonly interval?: number;
	readonly period?: 'day' | 'week' | 'month' | 'year';
	readonly days?: number[];
}
