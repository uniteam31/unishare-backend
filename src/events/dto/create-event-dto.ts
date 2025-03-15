export class CreateEventDto {
	/** Simple event */
	readonly title?: string;
	readonly startTime: string;
	readonly endTime?: string;
	readonly description?: string;
	readonly color?: string;

	/** Recursive event */
	readonly interval?: number;
	readonly period?: 'day' | 'week' | 'month' | 'year';
	readonly days?: number[];
}
