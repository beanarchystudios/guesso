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

type AssignmentInput = { courseId: string | number; assignmentId: string | number };

export const getSubmission = query(
	'unchecked',
	async (input: AssignmentInput & { include?: string[] }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions/self`,
			{ 'include[]': input.include }
		)
);

export const submitText = command('unchecked', async (input: AssignmentInput & { body: string }) =>
	canvasMutation<CanvasRecord>(
		'POST',
		`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions`,
		{ submission: { submission_type: 'online_text_entry', body: text(input.body, 'body') } }
	)
);

export const submitUrl = command('unchecked', async (input: AssignmentInput & { url: string }) =>
	canvasMutation<CanvasRecord>(
		'POST',
		`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions`,
		{ submission: { submission_type: 'online_url', url: text(input.url, 'url') } }
	)
);

export const addSubmissionComment = command(
	'unchecked',
	async (input: AssignmentInput & { comment: string; attempt?: number }) =>
		canvasMutation<CanvasRecord>(
			'PUT',
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions/self`,
			{
				comment: { text_comment: text(input.comment, 'comment') },
				include: input.attempt === undefined ? undefined : ['submission_history'],
				attempt: input.attempt
			}
		)
);

export const listPeerReviews = query(
	'unchecked',
	async (input: AssignmentInput & { perPage?: number }) =>
		canvasPage<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/peer_reviews`,
			{ per_page: bounded(input.perPage) }
		)
);

export const submitPeerReviewRubric = command(
	'unchecked',
	async (
		input: AssignmentInput & {
			submissionUserId: string | number;
			assessment: Record<string, unknown>;
		}
	) =>
		canvasMutation<CanvasRecord>(
			'POST',
			`courses/${id(input.courseId, 'courseId')}/assignments/${id(input.assignmentId, 'assignmentId')}/submissions/${id(input.submissionUserId, 'submissionUserId')}/rubric_assessments`,
			{ rubric_assessment: input.assessment }
		)
);
