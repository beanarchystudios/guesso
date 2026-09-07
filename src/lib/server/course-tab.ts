export type CourseTab = {
	id: string;
	label: string;
	htmlUrl: string;
};

function stringField(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function canvasHttpUrl(value: unknown, instanceUrl: string) {
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

export function parseCourseTab(
	record: Record<string, unknown>,
	instanceUrl: string
): CourseTab | null {
	const id = stringField(record.id);
	const label = stringField(record.label);
	const htmlUrl =
		canvasHttpUrl(record.full_url, instanceUrl) ?? canvasHttpUrl(record.html_url, instanceUrl);

	if (!id || !label || !htmlUrl || record.hidden === true) return null;

	return { id, label, htmlUrl };
}
