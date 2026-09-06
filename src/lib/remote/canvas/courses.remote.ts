import { command, query } from '$app/server';
import {
	bounded,
	canvasAllPages,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	type CanvasRecord
} from '$lib/server/canvas';

type CourseListInput = {
	enrollmentState?: 'active' | 'invited_or_pending' | 'completed';
	state?: 'unpublished' | 'available' | 'completed' | 'deleted';
	include?: string[];
	perPage?: number;
};

export type FavoriteCourse = {
	id: string | number;
	name: string;
	image_download_url?: string;
};

export const listCourses = query('unchecked', async (input: CourseListInput = {}) =>
	canvasPage<CanvasRecord>('courses', {
		enrollment_state: input.enrollmentState,
		state: input.state,
		'include[]': input.include,
		per_page: bounded(input.perPage)
	})
);

export const listFavoriteCourses = query(async () =>
	canvasAllPages<FavoriteCourse>('users/self/favorites/courses', {
		'include[]': ['course_image'],
		per_page: 100
	})
);

export const getCourse = query(
	'unchecked',
	async (input: { courseId: string | number; include?: string[] }) =>
		canvasGet<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}`, {
			'include[]': input.include
		})
);

export const listCourseTabs = query('unchecked', async (input: { courseId: string | number }) =>
	canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/tabs`)
);

export const getCourseActivity = query(
	'unchecked',
	async (input: { courseId: string | number; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/activity_stream`, {
			per_page: bounded(input.perPage)
		})
);

export const listCourseSections = query(
	'unchecked',
	async (input: { courseId: string | number; perPage?: number }) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/sections`, {
			per_page: bounded(input.perPage)
		})
);

export const listSelfEnrollments = query(
	'unchecked',
	async (input: { state?: string; perPage?: number } = {}) =>
		canvasPage<CanvasRecord>('users/self/enrollments', {
			state: input.state,
			per_page: bounded(input.perPage)
		})
);

export const setCourseFavorite = command(
	'unchecked',
	async (input: { courseId: string | number; favorite: boolean }) =>
		input.favorite
			? canvasMutation<CanvasRecord>(
					'POST',
					`users/self/favorites/courses/${id(input.courseId, 'courseId')}`
				)
			: canvasMutation<void>(
					'DELETE',
					`users/self/favorites/courses/${id(input.courseId, 'courseId')}`
				)
);

export const getCoursePermissions = query(
	'unchecked',
	async (input: { courseId: string | number; permissions: string[] }) =>
		canvasGet<Record<string, boolean>>(`courses/${id(input.courseId, 'courseId')}/permissions`, {
			'permissions[]': input.permissions
		})
);
