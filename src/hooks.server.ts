import { env } from '$env/dynamic/private';
import { redirect, type Handle } from '@sveltejs/kit';
import { openSession, SESSION_COOKIE } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.canvas = openSession(event.cookies.get(SESSION_COOKIE), env.SESSION_SECRET);
	if (!event.locals.canvas && event.cookies.get(SESSION_COOKIE))
		event.cookies.delete(SESSION_COOKIE, { path: '/' });
	if (event.route.id?.startsWith('/(app)') && !event.locals.canvas) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}
	const response = await resolve(event);
	response.headers.set('Cache-Control', 'private, no-store');
	return response;
};
