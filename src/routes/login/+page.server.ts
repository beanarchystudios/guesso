import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import { canvasFetch, canvasOrigin } from '$lib/server/canvas-connection';
import { returnPath, sealSession, SESSION_COOKIE, SESSION_SECONDS } from '$lib/server/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url, cookies }) => {
	if (url.searchParams.has('expired')) {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		locals.canvas = null;
	}
	if (locals.canvas) redirect(303, returnPath(url.searchParams.get('next')));
	return { expired: url.searchParams.has('expired') };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const rawUrl = data.get('instanceUrl');
		const rawToken = data.get('token');
		const instanceInput = typeof rawUrl === 'string' ? rawUrl.trim() : '';
		const token = typeof rawToken === 'string' ? rawToken.trim() : '';
		const invalid = (message: string, status = 400) =>
			fail(status, { message, instanceUrl: instanceInput });
		if (!instanceInput || !token) return invalid('Enter your Canvas URL and API token.');
		if (instanceInput.length > 253 || token.length > 1024 || /[^\x21-\x7e]/.test(token))
			return invalid('Check your Canvas URL and API token.');
		let instanceUrl: string;
		try {
			instanceUrl = canvasOrigin(instanceInput);
		} catch {
			return invalid(
				'Enter your Canvas HTTPS address, without a path, such as https://school.instructure.com.'
			);
		}
		let name: string;
		try {
			const response = await canvasFetch(`${instanceUrl}/api/v1/users/self/profile`, {
				headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
				signal: AbortSignal.timeout(15_000)
			});
			if (response.status === 401 || response.status === 403)
				return invalid('Canvas rejected this token. Check it or create a new token in Canvas.');
			if (response.status === 429)
				return invalid('Canvas is busy. Wait a moment and try again.', 429);
			if (!response.ok)
				return invalid('Could not connect to Canvas. Check the URL and try again.', 502);
			const profile = (await response.json()) as { id?: unknown; name?: unknown };
			if (!profile.id || typeof profile.name !== 'string')
				return invalid('This address did not return a Canvas account. Check your Canvas URL.');
			name = profile.name.slice(0, 200);
		} catch {
			return invalid(
				'Could not reach Canvas. Check the URL and your connection, then try again.',
				502
			);
		}
		const value = sealSession(
			{ instanceUrl, token, name, expires: Date.now() + SESSION_SECONDS * 1000 },
			env.SESSION_SECRET
		);
		cookies.set(SESSION_COOKIE, value, {
			path: '/',
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'lax',
			maxAge: SESSION_SECONDS
		});
		redirect(303, returnPath(url.searchParams.get('next')));
	}
};
