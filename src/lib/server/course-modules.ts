export type CourseModuleItem = {
	id: string;
	title: string;
	type: string;
	href: string | null;
	indent: number;
	completed: boolean | null;
};

export type CourseModule = {
	id: string;
	name: string;
	items: CourseModuleItem[];
	itemsCount: number;
	locked: boolean;
};

function stringField(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function canvasId(value: unknown) {
	if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return String(value);
	if (typeof value === 'string' && /^\d+$/.test(value.trim())) return value.trim();
	return null;
}

function sameOriginUrl(value: unknown, instanceUrl: string) {
	const raw = stringField(value);
	if (!raw) return null;

	try {
		const url = new URL(raw, instanceUrl);
		if (
			(url.protocol !== 'http:' && url.protocol !== 'https:') ||
			url.origin !== new URL(instanceUrl).origin
		) {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
}

function httpUrl(value: unknown) {
	const raw = stringField(value);
	if (!raw) return null;

	try {
		const url = new URL(raw);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
	} catch {
		return null;
	}
}

function parseModuleItem(record: Record<string, unknown>, instanceUrl: string) {
	const id = canvasId(record.id);
	const title = stringField(record.title);
	if (!id || !title) return null;

	const requirement =
		typeof record.completion_requirement === 'object' && record.completion_requirement !== null
			? (record.completion_requirement as Record<string, unknown>)
			: null;
	const completed = typeof requirement?.completed === 'boolean' ? requirement.completed : null;
	const indent =
		typeof record.indent === 'number' && Number.isInteger(record.indent)
			? Math.max(0, Math.min(record.indent, 4))
			: 0;

	return {
		id,
		title,
		type: stringField(record.type) ?? 'Item',
		href: sameOriginUrl(record.html_url, instanceUrl) ?? httpUrl(record.external_url),
		indent,
		completed
	} satisfies CourseModuleItem;
}

export function parseCourseModule(record: Record<string, unknown>, instanceUrl: string) {
	const id = canvasId(record.id);
	const name = stringField(record.name);
	if (!id || !name) return null;

	const items = Array.isArray(record.items)
		? record.items.flatMap((item) =>
				typeof item === 'object' && item !== null
					? [parseModuleItem(item as Record<string, unknown>, instanceUrl)].filter(
							(value): value is CourseModuleItem => value !== null
						)
					: []
			)
		: [];
	const itemsCount =
		typeof record.items_count === 'number' && Number.isInteger(record.items_count)
			? Math.max(0, record.items_count)
			: items.length;

	return {
		id,
		name,
		items,
		itemsCount,
		locked: record.state === 'locked'
	} satisfies CourseModule;
}
