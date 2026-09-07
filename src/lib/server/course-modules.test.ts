import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCourseModule } from './course-modules.ts';

test('course modules keep Canvas links and safe external URLs', () => {
	assert.deepEqual(
		parseCourseModule(
			{
				id: 42,
				name: 'Week 1',
				items_count: 2,
				items: [
					{
						id: 7,
						title: 'Reading',
						type: 'Page',
						html_url: '/courses/42/modules/items/7',
						completion_requirement: { completed: true }
					},
					{
						id: 8,
						title: 'Video',
						type: 'ExternalUrl',
						external_url: 'https://video.example/watch',
						indent: 1
					}
				]
			},
			'https://school.example'
		),
		{
			id: '42',
			name: 'Week 1',
			itemsCount: 2,
			locked: false,
			items: [
				{
					id: '7',
					title: 'Reading',
					type: 'Page',
					href: 'https://school.example/courses/42/modules/items/7',
					indent: 0,
					completed: true
				},
				{
					id: '8',
					title: 'Video',
					type: 'ExternalUrl',
					href: 'https://video.example/watch',
					indent: 1,
					completed: null
				}
			]
		}
	);
});

test('course modules drop malformed modules and unsafe links', () => {
	const module = parseCourseModule(
		{
			id: 42,
			name: 'Week 1',
			items: [
				{ id: 7, title: 'Unsafe', type: 'Page', html_url: 'javascript:alert(1)' },
				{
					id: 8,
					title: 'External',
					type: 'ExternalUrl',
					external_url: 'mailto:student@example.com'
				}
			]
		},
		'https://school.example'
	);

	assert.deepEqual(
		module?.items.map((item) => item.href),
		[null, null]
	);
	assert.equal(
		parseCourseModule({ id: 'not-an-id', name: 'Invalid' }, 'https://school.example'),
		null
	);
});
