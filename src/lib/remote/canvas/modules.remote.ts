import { command, query } from '$app/server';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	type CanvasRecord
} from '$lib/server/canvas';

export const listModules = query(
	'unchecked',
	async (input: { courseId: string | number; include?: string[]; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/modules`, {
			'include[]': input.include,
			per_page: bounded(input.perPage)
		})
);

export const getModule = query(
	'unchecked',
	async (input: { courseId: string | number; moduleId: string | number; include?: string[] }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/modules/${id(input.moduleId, 'moduleId')}`,
			{ 'include[]': input.include }
		)
);

export const listModuleItems = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		moduleId: string | number;
		include?: string[];
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/modules/${id(input.moduleId, 'moduleId')}/items`,
			{ 'include[]': input.include, per_page: bounded(input.perPage) }
		)
);

export const getModuleItem = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		moduleId: string | number;
		itemId: string | number;
		include?: string[];
	}) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/modules/${id(input.moduleId, 'moduleId')}/items/${id(input.itemId, 'itemId')}`,
			{ 'include[]': input.include }
		)
);

export const markModuleItemRead = command(
	'unchecked',
	async (input: {
		courseId: string | number;
		moduleId: string | number;
		itemId: string | number;
	}) =>
		canvasMutation<void>(
			'POST',
			`courses/${id(input.courseId, 'courseId')}/modules/${id(input.moduleId, 'moduleId')}/items/${id(input.itemId, 'itemId')}/mark_read`
		)
);

export const setModuleItemDone = command(
	'unchecked',
	async (input: {
		courseId: string | number;
		moduleId: string | number;
		itemId: string | number;
		done: boolean;
	}) =>
		canvasMutation<void>(
			input.done ? 'PUT' : 'DELETE',
			`courses/${id(input.courseId, 'courseId')}/modules/${id(input.moduleId, 'moduleId')}/items/${id(input.itemId, 'itemId')}/done`
		)
);
