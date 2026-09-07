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

export type Course = {
	id: string | number;
	name: string;
	enrollments?: Array<{
		enrollment_state?: 'active' | 'invited_or_pending' | 'completed';
	}>;
};

export type CourseDetails = {
	name: string;
};

export type CourseTab = {
	id: string;
	label: string;
	htmlUrl: string;
};

function stringField(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseCourse(record: CanvasRecord): CourseDetails | null {
	const name = stringField(record.name);
	return name ? { name } : null;
}

function parseCourseTab(record: CanvasRecord): CourseTab | null {
	const id = stringField(record.id);
	const label = stringField(record.label);
	const htmlUrl = stringField(record.html_url);

	if (!id || !label || !htmlUrl || record.hidden === true) return null;

	try {
		const url = new URL(htmlUrl);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
	} catch {
		return null;
	}

	return { id, label, htmlUrl };
}

export const listCourses = query('unchecked', async (input: CourseListInput = {}) =>
	canvasPage<CanvasRecord>('courses', {
		enrollment_state: input.enrollmentState,
		state: input.state,
		'include[]': input.include,
		per_page: bounded(input.perPage)
	})
);

export const listAllCourses = query(async () =>
	canvasAllPages<Course>('courses', {
		'include[]': ['enrollments'],
		per_page: 100
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
	async (input: { courseId: string | number; include?: string[] }): Promise<CourseDetails | null> =>
		parseCourse(
			await canvasGet<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}`, {
				'include[]': input.include
			})
		)
);

export const listCourseTabs = query(
	'unchecked',
	async (input: { courseId: string | number }): Promise<CourseTab[]> =>
		(await canvasAllPages<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/tabs`)).flatMap(
			(tab) => {
				const parsed = parseCourseTab(tab);
				return parsed ? [parsed] : [];
			}
		)
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
