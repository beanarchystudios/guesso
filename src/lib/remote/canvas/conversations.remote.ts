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

export const listConversations = query(
	'unchecked',
	async (input: {
		scope?: 'inbox' | 'unread' | 'starred' | 'archived' | 'sent';
		filter?: string[];
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>('conversations', {
			scope: input.scope,
			'filter[]': input.filter,
			per_page: bounded(input.perPage)
		})
);

export const getConversation = query(
	'unchecked',
	async (input: { conversationId: string | number; interleaveSubmissions?: boolean }) =>
		canvasGet<CanvasRecord>(`conversations/${id(input.conversationId, 'conversationId')}`, {
			interleave_submissions: input.interleaveSubmissions
		})
);

export const createConversation = command(
	'unchecked',
	async (input: {
		recipients: Array<string | number>;
		subject: string;
		body: string;
		contextCode?: string;
	}) =>
		canvasMutation<CanvasRecord>('POST', 'conversations', {
			recipients: input.recipients.map(String),
			subject: text(input.subject, 'subject'),
			body: text(input.body, 'body'),
			context_code: input.contextCode
		})
);

export const replyToConversation = command(
	'unchecked',
	async (input: {
		conversationId: string | number;
		body: string;
		recipients?: Array<string | number>;
	}) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`conversations/${id(input.conversationId, 'conversationId')}/add_message`,
			{
				body: text(input.body, 'body'),
				recipients: input.recipients?.map(String)
			}
		)
);

export const updateConversation = command(
	'unchecked',
	async (input: {
		conversationId: string | number;
		workflowState?: 'read' | 'unread' | 'archived';
		starred?: boolean;
	}) =>
		canvasMutation<CanvasRecord>(
			'PUT',
			`conversations/${id(input.conversationId, 'conversationId')}`,
			{
				conversation: {
					workflow_state: input.workflowState,
					starred: input.starred
				}
			}
		)
);

export const deleteConversation = command(
	'unchecked',
	async (input: { conversationId: string | number }) =>
		canvasMutation<void>('DELETE', `conversations/${id(input.conversationId, 'conversationId')}`)
);

export const getUnreadConversationCount = query(async () =>
	canvasGet<{ unread_count: string }>('conversations/unread_count')
);
