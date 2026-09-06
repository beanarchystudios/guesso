import { command, query } from '$app/server';
import { bounded, canvasMutation, canvasPage, id, type CanvasRecord } from '$lib/server/canvas';

export const listActivityStream = query(
	'unchecked',
	async (input: { onlyActiveCourses?: boolean; perPage?: number } = {}) =>
		canvasPage<CanvasRecord>('users/self/activity_stream', {
			only_active_courses: input.onlyActiveCourses,
			per_page: bounded(input.perPage)
		})
);

export const listNotificationPreferences = query(
	'unchecked',
	async (input: { channelId: string | number }) =>
		canvasPage<CanvasRecord>(
			`users/self/communication_channels/${id(input.channelId, 'channelId')}/notification_preferences`
		)
);

export const updateNotificationPreference = command(
	'unchecked',
	async (input: {
		channelId: string | number;
		notification: string;
		frequency: 'immediately' | 'daily' | 'weekly' | 'never';
	}) =>
		canvasMutation<CanvasRecord>(
			'PUT',
			`users/self/communication_channels/${id(input.channelId, 'channelId')}/notification_preferences/${encodeURIComponent(input.notification)}`,
			{ notification_preferences: { frequency: input.frequency } }
		)
);
