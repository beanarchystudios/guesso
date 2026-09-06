import { command, query } from '$app/server';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	type CanvasRecord
} from '$lib/server/canvas';

export const listCourseEnrollments = query(
	'unchecked',
	async (input: { courseId: string | number; include?: string[]; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/enrollments`, {
			user_id: 'self',
			'include[]': input.include ?? ['current_grading_period_scores'],
			per_page: bounded(input.perPage)
		})
);

export const listGradingPeriods = query(
	'unchecked',
	async (input: { courseId: string | number; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/grading_periods`, {
			per_page: bounded(input.perPage)
		})
);

export const getObservedUserGrades = query(
	'unchecked',
	async (input: { userId: string | number }) =>
		canvasGet<CanvasRecord>(`users/${id(input.userId, 'userId')}/grades`)
);

export const setWhatIfScore = command(
	'unchecked',
	async (input: { courseId: string | number; assignmentId: string | number; score: number }) =>
		canvasMutation<CanvasRecord>(
			'PUT',
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions/self`,
			{ submission: { posted_grade: String(input.score) } }
		)
);
