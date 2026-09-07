import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies, request, url }) => {
	if (request.headers.get('origin') !== url.origin)
		return new Response('Forbidden', { status: 403 });
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/login');
};
