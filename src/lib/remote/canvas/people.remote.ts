import { query } from '$app/server';
import { bounded, canvasGet, canvasPage, id, type CanvasRecord } from '$lib/server/canvas';

export const listCourseUsers = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		searchTerm?: string;
		enrollmentType?: string[];
		include?: string[];
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/users`, {
			search_term: input.searchTerm,
			'enrollment_type[]': input.enrollmentType,
			'include[]': input.include,
			per_page: bounded(input.perPage)
		})
);

export const getCourseUser = query(
	'unchecked',
	async (input: { courseId: string | number; userId: string | number; include?: string[] }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/users/${id(input.userId, 'userId')}`,
			{ 'include[]': input.include }
		)
);

export const searchRecipients = query(
	'unchecked',
	async (input: { search: string; context?: string; type?: string; perPage?: number }) =>
		canvasPage<CanvasRecord>('search/recipients', {
			search: input.search,
			context: input.context,
			type: input.type,
			per_page: bounded(input.perPage, 20, 100)
		})
);
