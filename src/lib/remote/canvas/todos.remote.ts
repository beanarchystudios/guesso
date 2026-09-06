import { query } from '$app/server';
import { bounded, canvasPage, type CanvasRecord } from '$lib/server/canvas';

export const listTodos = query(
	'unchecked',
	async (input: { include?: string[]; perPage?: number } = {}) =>
		canvasPage<CanvasRecord>('users/self/todo', {
			'include[]': input.include,
			per_page: bounded(input.perPage)
		})
);

export const listUpcomingEvents = query('unchecked', async (input: { perPage?: number } = {}) =>
	canvasPage<CanvasRecord>('users/self/upcoming_events', {
		per_page: bounded(input.perPage)
	})
);
