import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	account: locals.canvas
		? { name: locals.canvas.name, instanceUrl: locals.canvas.instanceUrl }
		: null
});
