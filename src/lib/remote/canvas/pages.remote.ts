import { command, query } from '$app/server';
import sanitizeHtml from 'sanitize-html';
import {
	bounded,
	canvasGet,
	canvasMutation,
	canvasPage,
	id,
	text,
	type CanvasRecord
} from '$lib/server/canvas';

export type CourseFrontPage = {
	title: string;
	body: string | null;
};

function stringField(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function sanitizeCourseHtml(body: string) {
	return sanitizeHtml(body, {
		allowedTags: [
			'a',
			'article',
			'blockquote',
			'br',
			'code',
			'col',
			'colgroup',
			'dd',
			'div',
			'dl',
			'dt',
			'em',
			'figcaption',
			'figure',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'hr',
			'img',
			'li',
			'ol',
			'p',
			'pre',
			'q',
			'small',
			'span',
			'strong',
			'sub',
			'sup',
			'table',
			'tbody',
			'td',
			'tfoot',
			'th',
			'thead',
			'tr',
			'u',
			'ul'
		],
		allowedAttributes: {
			a: ['href', 'title'],
			img: ['alt', 'height', 'src', 'width'],
			col: ['span'],
			colgroup: ['span'],
			td: ['colspan', 'rowspan'],
			th: ['colspan', 'rowspan', 'scope']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowedSchemesByTag: { img: ['http', 'https'] },
		allowProtocolRelative: false,
		disallowedTagsMode: 'discard'
	});
}

export const listPages = query(
	'unchecked',
	async (input: {
		courseId: string | number;
		sort?: string;
		order?: 'asc' | 'desc';
		searchTerm?: string;
		perPage?: number;
	}) =>
		canvasPage<CanvasRecord>(`courses/${id(input.courseId, 'courseId')}/pages`, {
			sort: input.sort,
			order: input.order,
			search_term: input.searchTerm,
			per_page: bounded(input.perPage)
		})
);

export const getPage = query(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string }) =>
		canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}`
		)
);

export const getFrontPage = query(
	'unchecked',
	async (input: { courseId: string | number }): Promise<CourseFrontPage> => {
		const page = await canvasGet<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/front_page`
		);
		const body = stringField(page.body);

		return {
			title: stringField(page.title) ?? 'Course front page',
			body: body ? sanitizeCourseHtml(body) : null
		};
	}
);

export const markPageRead = command(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string }) =>
		canvasMutation<void>(
			'POST',
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}/mark_read`
		)
);

export const listPageRevisions = query(
	'unchecked',
	async (input: { courseId: string | number; pageUrl: string; perPage?: number }) =>
		canvasPage<CanvasRecord>(
			`courses/${id(input.courseId, 'courseId')}/pages/${encodeURIComponent(text(input.pageUrl, 'pageUrl'))}/revisions`,
			{ per_page: bounded(input.perPage) }
		)
);
