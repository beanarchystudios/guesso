import { getRequestEvent } from '$app/server';
import { canvasFetch } from './canvas-connection';
import { error, redirect } from '@sveltejs/kit';
import ky, { HTTPError, type Options } from 'ky';

export type CanvasId = string | number;
export type CanvasRecord = Record<string, unknown>;
export type CanvasQueryValue = string | number | boolean | null | undefined;
export type CanvasQuery = Record<string, CanvasQueryValue | CanvasQueryValue[]>;

export interface CanvasPage<T> {
	items: T[];
	next: string | null;
}

function configuration() {
	const session = getRequestEvent().locals.canvas;
	if (!session) redirect(303, '/login');
	return session;
}

export function canvasInstanceUrl() {
	return configuration().instanceUrl;
}

function searchParams(query: CanvasQuery = {}) {
	const params = new URLSearchParams();
	for (const [key, raw] of Object.entries(query)) {
		for (const value of Array.isArray(raw) ? raw : [raw]) {
			if (value !== null && value !== undefined) params.append(key, String(value));
		}
	}
	return params;
}

function nextLink(value: string | null) {
	if (!value) return null;
	for (const part of value.split(',')) {
		const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
		if (match?.[2] === 'next') return match[1];
	}
	return null;
}

async function translateError(cause: unknown): Promise<never> {
	if (!(cause instanceof HTTPError)) error(502, 'Could not reach Canvas. Please try again.');

	const status = cause.response.status;
	let message = `Canvas request failed with status ${status}`;
	try {
		const body = (await cause.response.json()) as {
			message?: string;
			errors?: Array<{ message?: string }>;
		};
		message = body.message ?? body.errors?.[0]?.message ?? message;
	} catch {
		// Canvas sometimes returns an HTML error page.
	}

	if (status === 401) {
		redirect(303, '/login?expired=1');
	}
	if (status === 403) error(403, message);
	if (status === 404) error(404, message);
	if (status === 409) error(409, message);
	if (status === 422) error(422, message);
	if (status === 429) error(429, 'Canvas rate limit exceeded');
	error(status >= 500 ? 502 : 400, message);
}

async function request<T>(
	path: string,
	options: Options & { query?: CanvasQuery } = {}
): Promise<{ data: T; response: Response }> {
	const { instanceUrl, token } = configuration();
	const { query, ...requestOptions } = options;
	const url = path.startsWith('http') ? path : `${instanceUrl}/api/v1/${path.replace(/^\/+/, '')}`;

	if (new URL(url).origin !== instanceUrl) error(400, 'Invalid Canvas URL');
	try {
		const response = await ky(url, {
			fetch: canvasFetch,
			redirect: 'error',
			...requestOptions,
			searchParams: query ? searchParams(query) : requestOptions.searchParams,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
				...requestOptions.headers
			},
			retry: requestOptions.method && requestOptions.method !== 'GET' ? 0 : 2,
			timeout: 30_000
		});
		const data = response.status === 204 ? (undefined as T) : await response.json<T>();
		return { data, response };
	} catch (cause) {
		return translateError(cause);
	}
}

export async function canvasGet<T>(path: string, query?: CanvasQuery): Promise<T> {
	return (await request<T>(path, { query })).data;
}

export async function canvasPage<T>(path: string, query?: CanvasQuery): Promise<CanvasPage<T>> {
	const { data, response } = await request<T[]>(path, { query });
	return { items: data, next: nextLink(response.headers.get('link')) };
}

export async function canvasAllPages<T>(path: string, query?: CanvasQuery): Promise<T[]> {
	let page = await canvasPage<T>(path, query);
	const items = [...page.items];

	while (page.next) {
		page = await canvasNextPage<T>(page.next);
		items.push(...page.items);
	}

	return items;
}

export async function canvasNextPage<T>(url: string): Promise<CanvasPage<T>> {
	const { instanceUrl } = configuration();
	const target = new URL(url);
	if (target.origin !== new URL(instanceUrl).origin) error(400, 'Invalid Canvas pagination URL');
	const { data, response } = await request<T[]>(target.toString());
	return { items: data, next: nextLink(response.headers.get('link')) };
}

export async function canvasMutation<T>(
	method: 'POST' | 'PUT' | 'DELETE',
	path: string,
	body?: CanvasRecord
): Promise<T> {
	return (await request<T>(path, { method, json: body })).data;
}

export function id(value: CanvasId, name = 'id') {
	const normalized = String(value).trim();
	if (!normalized || !/^\d+$/.test(normalized)) error(400, `${name} must be a Canvas ID`);
	return normalized;
}

export function text(value: unknown, name: string) {
	if (typeof value !== 'string' || !value.trim()) error(400, `${name} is required`);
	return value.trim();
}

export function bounded(value: number | undefined, fallback = 50, maximum = 100) {
	if (value === undefined) return fallback;
	if (!Number.isInteger(value) || value < 1 || value > maximum) {
		error(400, `perPage must be between 1 and ${maximum}`);
	}
	return value;
}
