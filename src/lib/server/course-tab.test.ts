import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCourseTab } from './course-tab.ts';

const instanceUrl = 'https://school.instructure.com';

test('Canvas course tabs keep relative html_url values on the instance origin', () => {
	assert.deepEqual(
		parseCourseTab(
			{ id: 'assignments', label: 'Assignments', html_url: '/courses/42/assignments' },
			instanceUrl
		),
		{
			id: 'assignments',
			label: 'Assignments',
			htmlUrl: 'https://school.instructure.com/courses/42/assignments'
		}
	);
});

test('full_url is preferred when Canvas provides both tab links', () => {
	assert.equal(
		parseCourseTab(
			{
				id: 'home',
				label: 'Home',
				html_url: '/courses/42',
				full_url: 'https://school.instructure.com/courses/42?embed=true'
			},
			instanceUrl
		)?.htmlUrl,
		'https://school.instructure.com/courses/42?embed=true'
	);
});

test('hidden tabs and unsafe tab URLs are omitted', () => {
	assert.equal(
		parseCourseTab(
			{ id: 'files', label: 'Files', html_url: '/courses/42/files', hidden: true },
			instanceUrl
		),
		null
	);
	assert.equal(
		parseCourseTab({ id: 'home', label: 'Home', html_url: 'javascript:alert(1)' }, instanceUrl),
		null
	);
	assert.equal(
		parseCourseTab({ id: 'home', label: 'Home', html_url: '//evil.example/phish' }, instanceUrl),
		null
	);
});
