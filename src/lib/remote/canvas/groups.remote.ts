import { command, query } from '$app/server';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	type CanvasRecord
} from '$lib/server/canvas';

export const listMyGroups = query(
	'unchecked',
	async (input: { contextType?: 'Account' | 'Course'; perPage?: number } = {}) =>
		canvasPage<CanvasRecord>('users/self/groups', {
			context_type: input.contextType,
			per_page: bounded(input.perPage)
		})
);

export const getGroup = query('unchecked', async (input: { groupId: string | number }) =>
	canvasGet<CanvasRecord>(`groups/${id(input.groupId, 'groupId')}`)
);

export const listGroupUsers = query(
	'unchecked',
	async (input: { groupId: string | number; searchTerm?: string; perPage?: number }) =>
		canvasPage<CanvasRecord>(`groups/${id(input.groupId, 'groupId')}/users`, {
			search_term: input.searchTerm,
			per_page: bounded(input.perPage)
		})
);

export const listGroupTabs = query('unchecked', async (input: { groupId: string | number }) =>
	canvasPage<CanvasRecord>(`groups/${id(input.groupId, 'groupId')}/tabs`)
);

export const joinGroup = command('unchecked', async (input: { groupId: string | number }) =>
	canvasMutation<CanvasRecord>('POST', `groups/${id(input.groupId, 'groupId')}/memberships`)
);

export const leaveGroup = command('unchecked', async (input: { groupId: string | number }) =>
	canvasMutation<void>('DELETE', `groups/${id(input.groupId, 'groupId')}/memberships/self`)
);
