import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export const SESSION_COOKIE = 'guesso_session';
export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export interface CanvasSession {
	instanceUrl: string;
	token: string;
	name: string;
	expires: number;
}

function key(secret: string | undefined) {
	if (!secret || !/^[a-f\d]{64}$/i.test(secret)) {
		throw new Error('SESSION_SECRET must be 32 random bytes encoded as 64 hexadecimal characters');
	}
	return Buffer.from(secret, 'hex');
}

export function sealSession(session: CanvasSession, secret: string | undefined) {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
	const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);
	return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function openSession(
	value: string | undefined,
	secret: string | undefined
): CanvasSession | null {
	if (!value) return null;
	const sessionKey = key(secret);
	try {
		const bytes = Buffer.from(value, 'base64url');
		const decipher = createDecipheriv('aes-256-gcm', sessionKey, bytes.subarray(0, 12));
		decipher.setAuthTag(bytes.subarray(12, 28));
		const session = JSON.parse(
			Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
		);
		if (
			typeof session.instanceUrl !== 'string' ||
			typeof session.token !== 'string' ||
			typeof session.name !== 'string' ||
			!Number.isFinite(session.expires) ||
			session.expires <= Date.now()
		)
			return null;
		return session;
	} catch {
		return null;
	}
}

export function returnPath(value: string | null) {
	return value?.startsWith('/') &&
		!value.startsWith('//') &&
		// eslint-disable-next-line no-control-regex -- Browsers strip control characters when resolving URLs.
		!/[\\\x00-\x20]/.test(value) &&
		!/^\/(login|logout)(?:[/?#]|$)/.test(value)
		? value
		: '/dashboard';
}
