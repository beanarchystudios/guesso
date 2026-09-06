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

const topicPath = (courseId: string | number, topicId: string | number) =>
	`courses/${id(courseId, 'courseId')}/discussion_topics/${id(topicId, 'topicId')}`;

export const listDiscussionTopics = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		orderBy?: string;
		scope?: string;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/discussion_topics`, {
			order_by: input.orderBy,
			scope: input.scope,
			per_page: bounded(input.perPage)
		})
);

export const getDiscussionTopic = query(
	'unchecked',
	async (input: { courseId: string | number; topicId: string | number }) =>
		canvasGet<CanvasRecord>(topicPath(input.courseId, input.topicId))
);

export const getDiscussionView = query(
	'unchecked',
	async (input: { courseId: string | number; topicId: string | number }) =>
		canvasGet<CanvasRecord>(`${topicPath(input.courseId, input.topicId)}/view`)
);

export const createDiscussionEntry = command(
	'unchecked',
	async (input: { courseId: string | number; topicId: string | number; message: string }) =>
		canvasMutation<CanvasRecord>('POST', `${topicPath(input.courseId, input.topicId)}/entries`, {
			message: text(input.message, 'message')
		})
);

export const replyToDiscussionEntry = command(
	'unchecked',
	async (input: {
		courseId: string | number;
		topicId: string | number;
		entryId: string | number;
		message: string;
	}) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`${topicPath(input.courseId, input.topicId)}/entries/${id(input.entryId, 'entryId')}/replies`,
			{ message: text(input.message, 'message') }
		)
);

export const setDiscussionRead = command(
	'unchecked',
	async (input: { courseId: string | number; topicId: string | number; read: boolean }) =>
		canvasMutation<void>(
			input.read ? 'PUT' : 'DELETE',
			`${topicPath(input.courseId, input.topicId)}/read`
		)
);

export const setDiscussionSubscribed = command(
	'unchecked',
	async (input: { courseId: string | number; topicId: string | number; subscribed: boolean }) =>
		canvasMutation<void>(
			input.subscribed ? 'PUT' : 'DELETE',
			`${topicPath(input.courseId, input.topicId)}/subscribed`
		)
);
