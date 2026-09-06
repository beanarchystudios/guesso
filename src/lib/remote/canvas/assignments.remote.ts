import { query } from '$app/server';
import { bounded, canvasGet, canvasPage, id, type CanvasRecord } from '$lib/server/canvas';

export const listAssignments = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		bucket?: string;
		orderBy?: string;
		include?: string[];
		searchTerm?: string;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/assignments`, {
			bucket: input.bucket,
			order_by: input.orderBy,
			'include[]': input.include,
			search_term: input.searchTerm,
			per_page: bounded(input.perPage)
		})
);

export const getAssignment = query(
	'unchecked',
	async (input: { courseId: string | number; assignmentId: string | number; include?: string[] }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}`,
			{ 'include[]': input.include }
		)
);

export const listAssignmentGroups = query(
	'unchecked',
	async (input: { courseId: string | number; includeAssignments?: boolean; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/assignment_groups`, {
			'include[]': input.includeAssignments ? ['assignments'] : undefined,
			per_page: bounded(input.perPage)
		})
);

export const listAssignmentOverrides = query(
	'unchecked',
	async (input: { courseId: string | number; assignmentId: string | number; perPage?: number }) =>
		canvasPage<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/overrides`,
			{ per_page: bounded(input.perPage) }
		)
);
