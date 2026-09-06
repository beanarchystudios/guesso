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

export const listCalendarEvents = query(
	'unchecked',
	async (input: {
		startDate: string;
		endDate: string;
		contextCodes?: string[];
		type?: 'event' | 'assignment';
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>('calendar_events', {
			start_date: text(input.startDate, 'startDate'),
			end_date: text(input.endDate, 'endDate'),
			'context_codes[]': input.contextCodes,
			type: input.type,
			per_page: bounded(input.perPage)
		})
);

export const getCalendarEvent = query('unchecked', async (input: { eventId: string | number }) =>
	canvasGet<CanvasRecord>(`calendar_events/${id(input.eventId, 'eventId')}`)
);

export const createCalendarEvent = command('unchecked', async (event: Record<string, unknown>) =>
	canvasMutation<CanvasRecord>('POST', 'calendar_events', { calendar_event: event })
);

export const updateCalendarEvent = command(
	'unchecked',
	async (input: { eventId: string | number; event: Record<string, unknown> }) =>
		canvasMutation<CanvasRecord>('PUT', `calendar_events/${id(input.eventId, 'eventId')}`, {
			calendar_event: input.event
		})
);

export const deleteCalendarEvent = command(
	'unchecked',
	async (input: { eventId: string | number; cancelReason?: string }) =>
		canvasMutation<CanvasRecord>('DELETE', `calendar_events/${id(input.eventId, 'eventId')}`, {
			cancel_reason: input.cancelReason
		})
);

export const listAppointmentGroups = query(
	'unchecked',
	async (input: {
		scope?: 'reservable' | 'manageable';
		contextCodes?: string[];
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>('appointment_groups', {
			scope: input.scope ?? 'reservable',
			'context_codes[]': input.contextCodes,
			per_page: bounded(input.perPage)
		})
);

export const reserveAppointment = command(
	'unchecked',
	async (input: { eventId: string | number; comments?: string }) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`calendar_events/${id(input.eventId, 'eventId')}/reservations`,
			{ comments: input.comments }
		)
);

export const cancelAppointment = command(
	'unchecked',
	async (input: { eventId: string | number; cancelReason?: string }) =>
		canvasMutation<CanvasRecord>(
			'DELETE',
			`calendar_events/${id(input.eventId, 'eventId')}/reservations`,
			{ cancel_reason: input.cancelReason }
		)
);
