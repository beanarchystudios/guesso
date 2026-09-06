import { query } from '$app/server';
import { bounded, canvasGet, canvasPage, id, type CanvasRecord } from '$lib/server/canvas';

export const listAnnouncements = query(
	'unchecked',
	async (input: {
		contextCodes: string[];
		startDate?: string;
		endDate?: string;
		activeOnly?: boolean;
		latestOnly?: boolean;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>('announcements', {
			'context_codes[]': input.contextCodes,
			start_date: input.startDate,
			end_date: input.endDate,
			active_only: input.activeOnly,
			latest_only: input.latestOnly,
			per_page: bounded(input.perPage)
		})
);

export const getAnnouncement = query(
	'unchecked',
	async (input: { courseId: string | number; announcementId: string | number }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/discussion_topics/${id(input.announcementId, 'announcementId')}`
		)
);
