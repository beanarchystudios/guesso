import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { error } from '@sveltejs/kit';
import {
	courseFrontPage,
	courseFrontPageIfMissing,
	sanitizeCourseHtml
} from './course-front-page.ts';

test('htmlparser2 used by sanitize-html still has a CommonJS entry for Vercel', () => {
	const require = createRequire(import.meta.url);
	const fromSanitizeHtml = createRequire(require.resolve('sanitize-html'));
	const htmlparserPath = fromSanitizeHtml.resolve('htmlparser2');
	assert.match(
		htmlparserPath,
		/commonjs/,
		`sanitize-html resolved ESM-only htmlparser2 at ${htmlparserPath}; Vercel cannot require() that build`
	);
	assert.equal(fromSanitizeHtml('sanitize-html')('<p>Hello</p>'), '<p>Hello</p>');
});

test('course HTML drops scripts and unsafe URLs', () => {
	const html = sanitizeCourseHtml(
		'<p>Read <a href="https://example.edu">this</a></p><script>alert(1)</script><img src="javascript:alert(1)">'
	);
	assert.match(html, /Read/);
	assert.doesNotMatch(html, /script/i);
	assert.doesNotMatch(html, /javascript:/i);
});

test('a Canvas wiki without a front page is empty rather than a hard failure', () => {
	try {
		error(404, 'page not found');
	} catch (cause) {
		assert.deepEqual(courseFrontPageIfMissing(cause), {
			title: 'Course front page',
			body: null
		});
	}

	try {
		error(502, 'Could not reach Canvas. Please try again.');
	} catch (cause) {
		assert.equal(courseFrontPageIfMissing(cause), null);
	}
});

test('front page mapping keeps a title when the body is blank', () => {
	assert.deepEqual(courseFrontPage({ title: 'Welcome', body: '' }), {
		title: 'Welcome',
		body: null
	});
});
