import { lookup } from 'node:dns';
import { isIP } from 'node:net';
import ipaddr from 'ipaddr.js';
import { Agent, fetch as undiciFetch, type RequestInit } from 'undici';

export function publicAddress(address: string) {
	return ipaddr.isValid(address) && ipaddr.process(address).range() === 'unicast';
}

export function canvasOrigin(value: string) {
	const url = new URL(value.trim());
	const hostname = url.hostname.replace(/^\[|\]$/g, '');
	if (
		url.protocol !== 'https:' ||
		url.username ||
		url.password ||
		url.port ||
		url.search ||
		url.hash ||
		url.pathname !== '/' ||
		(isIP(hostname)
			? !publicAddress(hostname)
			: !hostname.includes('.') || hostname.endsWith('.localhost'))
	) {
		throw new Error(
			'Enter your Canvas HTTPS address, without a path, such as https://school.instructure.com.'
		);
	}
	return url.origin;
}

// Validate the address at connection time, so DNS changes cannot bypass the check.
const dispatcher = new Agent({
	connect: {
		lookup(hostname, options, callback) {
			lookup(hostname, { ...options, all: true }, (error, addresses) => {
				if (error) return callback(error, [], 0);
				if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) {
					return callback(new Error('Canvas must use a public internet address'), [], 0);
				}
				if (options.all) callback(null, addresses);
				else callback(null, addresses[0].address, addresses[0].family);
			});
		}
	}
});

export const canvasFetch: typeof fetch = async (input, init) => {
	const request = new Request(input, init);
	// IP literals bypass DNS lookup, so validate them here too.
	canvasOrigin(new URL(request.url).origin);
	const response = await undiciFetch(request.url, {
		method: request.method,
		headers: Object.fromEntries(request.headers),
		body: request.body as RequestInit['body'],
		signal: request.signal,
		duplex: 'half',
		dispatcher,
		redirect: 'error'
	});
	return new Response(response.body as unknown as ReadableStream | null, {
		status: response.status,
		statusText: response.statusText,
		headers: Object.fromEntries(response.headers)
	});
};
