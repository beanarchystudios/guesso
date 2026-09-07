// Run after bun run build with node --experimental-test-module-mocks --test tests/auth.test.mjs.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'devalue';
import { MockAgent, fetch as undiciFetch } from 'undici';

const canvas = new MockAgent();
canvas.disableNetConnect();
const pool = canvas.get('https://school.instructure.com');
const calls = [];
let rejectAlice = false;
pool
	.intercept({ path: /./, method: 'GET' })
	.reply((options) => {
		const token = new Headers(options.headers).get('authorization');
		calls.push({ path: options.path, token });
		if (token === 'Bearer rejected' || (rejectAlice && token === 'Bearer alice'))
			return { statusCode: 401, data: '{}' };
		if (options.path.includes('/profile'))
			return {
				statusCode: 200,
				data: JSON.stringify({
					id: token === 'Bearer alice' ? 1 : 2,
					name: token === 'Bearer alice' ? 'Alice Student' : 'Bob Student'
				})
			};
		if (options.path.includes('/colors')) return { statusCode: 200, data: '{"custom_colors":{}}' };
		return { statusCode: 200, data: '[]' };
	})
	.persist();
mock.module('undici', {
	namedExports: {
		Agent: class {
			constructor() {
				return canvas;
			}
		},
		fetch: undiciFetch
	}
});
const { Server } = await import('../.svelte-kit/output/server/index.js');
const { manifest } = await import('../.svelte-kit/output/server/manifest.js');
const server = new Server(manifest);
await server.init({ env: { SESSION_SECRET: 'a'.repeat(64) } });
const origin = 'https://guesso.example';
function request(path, { cookie, form, method } = {}) {
	return server.respond(
		new Request(origin + path, {
			method: method ?? (form ? 'POST' : 'GET'),
			headers: {
				accept: 'text/html',
				...(cookie ? { cookie } : {}),
				...(form || method === 'POST' ? { origin } : {})
			},
			body: form ? new URLSearchParams(form) : undefined
		}),
		{ getClientAddress: () => '127.0.0.1' }
	);
}
async function login(token, next = '/dashboard') {
	return request(`/login?next=${encodeURIComponent(next)}`, {
		form: { instanceUrl: 'https://school.instructure.com', token }
	});
}

test('direct app requests require login; rejected credentials never create sessions', async () => {
	const response = await request('/courses/42');
	assert.equal(response.status, 303);
	assert.equal(response.headers.get('location'), '/login?next=%2Fcourses%2F42');
	const failed = await login('rejected');
	assert.equal(failed.status, 400);
	assert.equal(failed.headers.get('set-cookie'), null);
	const html = await failed.text();
	assert.match(html, /Canvas rejected this token/);
	assert.ok(!html.includes('value="rejected"'));
});

test('successful login persists securely and concurrent accounts use their own Canvas token', async () => {
	const [alice, bob] = await Promise.all([login('alice'), login('bob')]);
	assert.equal(alice.status, 303);
	assert.equal(alice.headers.get('location'), '/dashboard');
	const a = alice.headers.get('set-cookie');
	const b = bob.headers.get('set-cookie');
	for (const cookie of [a, b]) {
		assert.match(cookie, /HttpOnly/);
		assert.match(cookie, /Secure/);
		assert.match(cookie, /SameSite=Lax/);
		assert.match(cookie, /Max-Age=2592000/);
	}
	assert.ok(!a.includes('alice'));
	calls.length = 0;
	const [pageA, pageB] = await Promise.all([
		request('/dashboard', { cookie: a.split(';')[0] }),
		request('/dashboard', { cookie: b.split(';')[0] })
	]);
	const [htmlA, htmlB] = await Promise.all([pageA.text(), pageB.text()]);
	assert.equal(pageA.status, 200);
	assert.match(htmlA, /Alice Student/);
	assert.ok(!htmlA.includes('Bob Student'));
	assert.match(htmlB, /Bob Student/);
	assert.ok(!htmlB.includes('Alice Student'));
	assert.equal(pageA.headers.get('cache-control'), 'private, no-store');
	assert.ok(
		htmlA.includes('Loading favorite courses'),
		'dashboard retains initial loading state during SSR'
	);
	assert.equal(calls.filter((c) => c.token === 'Bearer alice').length, 1);
	assert.equal(calls.filter((c) => c.token === 'Bearer bob').length, 1);
	const reloaded = await request('/dashboard', { cookie: a.split(';')[0] });
	assert.equal(reloaded.status, 200);
	const logout = await request('/logout', { cookie: a.split(';')[0], method: 'POST' });
	assert.equal(logout.status, 303);
	assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
	assert.equal((await request('/dashboard')).status, 303);
});

test('invalid URLs fail before Canvas requests and redirect targets cannot leave Guesso', async () => {
	const count = calls.length;
	const invalid = await request('/login', {
		form: { instanceUrl: 'https://127.0.0.1', token: 'alice' }
	});
	assert.equal(invalid.status, 400);
	assert.equal(calls.length, count);
	const response = await login('alice', '//evil.example');
	assert.equal(response.headers.get('location'), '/dashboard');
});

async function favoriteRemote() {
	for (const [id, load] of Object.entries(manifest._.remotes)) {
		if ((await load()).default.listFavoriteCourses) return `/_app/remote/${id}/listFavoriteCourses`;
	}
	throw new Error('Favorite courses remote missing');
}

test('remote queries enforce login and expired Canvas tokens recover without a redirect loop', async () => {
	const path = await favoriteRemote();
	const anonymous = await request(path);
	const anonymousResult = parse((await anonymous.json()).data);
	assert.equal(anonymousResult.redirect, '/login');
	const signedIn = await login('alice');
	const cookie = signedIn.headers.get('set-cookie').split(';')[0];
	rejectAlice = true;
	try {
		const expired = await request(path, { cookie });
		const result = parse((await expired.json()).data);
		assert.equal(result.redirect, '/login?expired=1');
		const page = await request(result.redirect, { cookie });
		assert.equal(page.status, 200);
		assert.match(page.headers.get('set-cookie'), /Max-Age=0/);
		assert.ok((await page.text()).includes('Connect again to continue'));
	} finally {
		rejectAlice = false;
	}
});

test('Canvas transport preserves mutation bodies and blocks redirects', async () => {
	const { canvasFetch } = await import('../src/lib/server/canvas-connection.ts');
	const { default: ky } = await import('ky');
	let mutationBody;
	pool
		.intercept({
			method: 'POST',
			path: '/api/v1/synthetic',
			headers: { authorization: 'Bearer synthetic' }
		})
		.reply((options) => {
			mutationBody = options.body;
			return { statusCode: 204 };
		});
	const response = await ky.post('https://school.instructure.com/api/v1/synthetic', {
		fetch: canvasFetch,
		json: { value: 'draft' },
		headers: { Authorization: 'Bearer synthetic' },
		retry: 0
	});
	assert.equal(response.status, 204);
	assert.equal(await new Response(mutationBody).text(), '{"value":"draft"}');
	canvas
		.get('https://redirect.instructure.com')
		.intercept({ path: '/' })
		.reply(302, '', { headers: { location: 'https://other.example/' } });
	await assert.rejects(
		canvasFetch('https://redirect.instructure.com/', {
			headers: { Authorization: 'Bearer synthetic' }
		})
	);
});

test('cross-origin login and sign-out requests are rejected', async () => {
	for (const path of ['/login', '/logout']) {
		const response = await server.respond(
			new Request(origin + path, {
				method: 'POST',
				headers: { origin: 'https://other.example', accept: 'text/html' },
				body: new URLSearchParams({ instanceUrl: 'https://school.instructure.com', token: 'alice' })
			}),
			{ getClientAddress: () => '127.0.0.1' }
		);
		assert.equal(response.status, 403);
		assert.equal(response.headers.get('set-cookie'), null);
	}
});
