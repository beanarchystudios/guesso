import { command, query } from '$app/server';
import { canvasGet, canvasMutation, canvasPage, id, type CanvasRecord } from '$lib/server/canvas';

export interface CurrentUser {
	name: string;
	short_name?: string | null;
	avatar_url?: string | null;
	bio?: string | null;
	primary_email?: string | null;
	email?: string | null;
	login_id?: string | null;
	time_zone?: string | null;
	locale?: string | null;
	html_url?: string | null;
}

export const getCurrentUser = query(async () => canvasGet<CurrentUser>('users/self/profile'));

export const getUserSettings = query(async () => canvasGet<CanvasRecord>('users/self/settings'));

export const updateUserSettings = command('unchecked', async (settings: Record<string, unknown>) =>
	canvasMutation<CanvasRecord>('PUT', 'users/self/settings', { user: settings })
);

export const getDashboardPositions = query(async () =>
	canvasGet<Record<string, string>>('users/self/dashboard_positions')
);

export const updateDashboardPositions = command(
	'unchecked',
	async (dashboardPositions: Record<string, string>) =>
		canvasMutation<Record<string, string>>('PUT', 'users/self/dashboard_positions', {
			dashboard_positions: dashboardPositions
		})
);

export const getCustomColors = query(async () => {
	const response = await canvasGet<{ custom_colors?: Record<string, string> }>('users/self/colors');
	return response.custom_colors ?? {};
});

export const updateCustomColor = command(
	'unchecked',
	async (input: { asset: string; hexcode: string }) =>
		canvasMutation<CanvasRecord>('PUT', `users/self/colors/${encodeURIComponent(input.asset)}`, {
			hexcode: input.hexcode
		})
);

export const listCommunicationChannels = query(async () =>
	canvasPage<CanvasRecord>('users/self/communication_channels')
);

export const deleteCommunicationChannel = command(
	'unchecked',
	async (input: { channelId: string | number }) =>
		canvasMutation<void>(
			'DELETE',
			`users/self/communication_channels/${id(input.channelId, 'channelId')}`
		)
);
