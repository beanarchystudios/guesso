import { isHttpError } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import type { CanvasRecord } from './canvas';

export type CourseFrontPage = {
	title: string;
	body: string | null;
};

function stringField(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function sanitizeCourseHtml(body: string) {
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

export function emptyCourseFrontPage(): CourseFrontPage {
	return { title: 'Course front page', body: null };
}

export function courseFrontPage(page: CanvasRecord): CourseFrontPage {
	const body = stringField(page.body);

	return {
		title: stringField(page.title) ?? 'Course front page',
		body: body ? sanitizeCourseHtml(body) : null
	};
}

export function courseFrontPageIfMissing(cause: unknown): CourseFrontPage | null {
	if (isHttpError(cause) && cause.status === 404) return emptyCourseFrontPage();
	return null;
}
