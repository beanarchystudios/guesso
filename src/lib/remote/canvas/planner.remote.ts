import { command, query } from '$app/server';
import {
	bounded,
	canvasMutation,
	canvasPage,
	id,
	text,
	type CanvasRecord
} from '$lib/server/canvas';

export const listPlannerItems = query(
	'unchecked',
	async (input: {
		startDate: string;
		endDate: string;
		contextCodes?: string[];
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>('planner/items', {
			start_date: text(input.startDate, 'startDate'),
			end_date: text(input.endDate, 'endDate'),
			'context_codes[]': input.contextCodes,
			per_page: bounded(input.perPage)
		})
);

export const listPlannerNotes = query(
	'unchecked',
	async (input: { startDate?: string; endDate?: string; perPage?: number } = {}) =>
		canvasPage<CanvasRecord>('planner_notes', {
			start_date: input.startDate,
			end_date: input.endDate,
			per_page: bounded(input.perPage)
		})
);

export const createPlannerNote = command('unchecked', async (note: Record<string, unknown>) =>
	canvasMutation<CanvasRecord>('POST', 'planner_notes', { planner_note: note })
);

export const updatePlannerNote = command(
	'unchecked',
	async (input: { noteId: string | number; note: Record<string, unknown> }) =>
		canvasMutation<CanvasRecord>('PUT', `planner_notes/${id(input.noteId, 'noteId')}`, {
			planner_note: input.note
		})
);

export const deletePlannerNote = command('unchecked', async (input: { noteId: string | number }) =>
	canvasMutation<void>('DELETE', `planner_notes/${id(input.noteId, 'noteId')}`)
);

export const updatePlannerOverride = command(
	'unchecked',
	async (input: {
		plannableType: string;
		plannableId: string | number;
		markedComplete?: boolean;
		dismissed?: boolean;
	}) =>
		canvasMutation<CanvasRecord>('PUT', 'planner/overrides', {
			planner_override: {
				plannable_type: text(input.plannableType, 'plannableType'),
				plannable_id: id(input.plannableId, 'plannableId'),
				marked_complete: input.markedComplete,
				dismissed: input.dismissed
			}
		})
);
