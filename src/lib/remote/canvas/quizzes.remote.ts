import { command, query } from '$app/server';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	type CanvasRecord
} from '$lib/server/canvas';

const quizPath = (courseId: string | number, quizId: string | number) =>
	`courses/${id(courseId, 'courseId')}/quizzes/${id(quizId, 'quizId')}`;

export const listQuizzes = query(
	'unchecked',
	async (input: { courseId: string | number; searchTerm?: string; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/quizzes`, {
			search_term: input.searchTerm,
			per_page: bounded(input.perPage)
		})
);

export const getQuiz = query(
	'unchecked',
	async (input: { courseId: string | number; quizId: string | number }) =>
		canvasGet<CanvasRecord>(quizPath(input.courseId, input.quizId))
);

export const startQuizAttempt = command(
	'unchecked',
	async (input: { courseId: string | number; quizId: string | number; accessCode?: string }) =>
		canvasMutation<CanvasRecord>('POST', `${quizPath(input.courseId, input.quizId)}/submissions`, {
			access_code: input.accessCode
		})
);

export const getQuizAttempt = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		quizId: string | number;
		submissionId: string | number;
	}) =>
		canvasGet<CanvasRecord>(
			`${quizPath(input.courseId, input.quizId)}/submissions/${id(input.submissionId, 'submissionId')}`
		)
);

export const listQuizQuestions = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		quizId: string | number;
		submissionId: string | number;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(
			`${quizPath(input.courseId, input.quizId)}/submissions/${id(input.submissionId, 'submissionId')}/questions`,
			{ per_page: bounded(input.perPage) }
		)
);

export const saveQuizAnswers = command(
	'unchecked',
	async (input: {
		courseId: string | number;
		quizId: string | number;
		submissionId: string | number;
		validationToken: string;
		attempt: number;
		questions: Record<string, unknown>[];
	}) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`${quizPath(input.courseId, input.quizId)}/submissions/${id(input.submissionId, 'submissionId')}/questions`,
			{
				validation_token: input.validationToken,
				attempt: input.attempt,
				quiz_questions: input.questions
			}
		)
);

export const completeQuizAttempt = command(
	'unchecked',
	async (input: {
		courseId: string | number;
		quizId: string | number;
		submissionId: string | number;
		validationToken: string;
		attempt: number;
	}) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`${quizPath(input.courseId, input.quizId)}/submissions/${id(input.submissionId, 'submissionId')}/complete`,
			{ validation_token: input.validationToken, attempt: input.attempt }
		)
);
