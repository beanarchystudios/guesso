import { query } from '$app/server';
import { canvasNextPage, type CanvasRecord } from '$lib/server/canvas';

export const getNextPage = query('unchecked', async (input: { url: string }) => {
	if (typeof input?.url !== 'string') throw new TypeError('url is required');
	return canvasNextPage<CanvasRecord>(input.url);
});
