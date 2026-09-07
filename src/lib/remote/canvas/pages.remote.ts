import { command, query } from '$app/server';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	text,
	type CanvasRecord
} from '$lib/server/canvas';
import {
	courseFrontPage,
	courseFrontPageIfMissing,
	type CourseFrontPage
} from '$lib/server/course-front-page';

export type { CourseFrontPage };

export const listPages = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		sort?: string;
		order?: 'asc' | 'desc';
		searchTerm?: string;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/pages`, {
			sort: input.sort,
			order: input.order,
			search_term: input.searchTerm,
			per_page: bounded(input.perPage)
		})
);

export const getPage = query(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}`
		)
);

export const getFrontPage = query(
	'unchecked',
	async (input: { courseId: string | number }): Promise<CourseFrontPage> => {
		try {
			return courseFrontPage(
				await canvasGet<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/front_page`)
			);
		} catch (cause) {
			const missing = courseFrontPageIfMissing(cause);
			if (missing) return missing;
			throw cause;
		}
	}
);

export const markPageRead = command(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string }) =>
		canvasMutation<void>(
			'POST',
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}/mark_read`
		)
);

export const listPageRevisions = query(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string; perPage?: number }) =>
		canvasPage<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}/revisions`,
			{ per_page: bounded(input.perPage) }
		)
);
