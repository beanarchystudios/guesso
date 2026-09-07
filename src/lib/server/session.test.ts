import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSession, sealSession, returnPath } from './session.ts';
import { canvasOrigin, publicAddress } from './canvas-connection.ts';

const secret = 'a'.repeat(64);
const alice = {
	instanceUrl: 'https://school.instructure.com',
	token: 'synthetic-alice-token',
	name: 'Alice',
	expires: Date.now() + 60_000
};

test('sessions preserve individual credentials without exposing plaintext', () => {
	const bob = { ...alice, token: 'synthetic-bob-token', name: 'Bob' };
	const a = sealSession(alice, secret);
	const b = sealSession(bob, secret);
	assert.deepEqual(openSession(a, secret), alice);
	assert.deepEqual(openSession(b, secret), bob);
	assert.ok(!Buffer.from(a, 'base64url').includes(Buffer.from(alice.token)));
	assert.notEqual(a, sealSession(alice, secret));
});

test('expired, tampered, malformed, and differently encrypted sessions fail closed', () => {
	assert.equal(
		openSession(sealSession({ ...alice, expires: Date.now() - 1 }, secret), secret),
		null
	);
	const encrypted = Buffer.from(sealSession(alice, secret), 'base64url');
	encrypted[30] ^= 1;
	assert.equal(openSession(encrypted.toString('base64url'), secret), null);
	assert.equal(openSession('garbage', secret), null);
	assert.equal(openSession(sealSession(alice, secret), 'b'.repeat(64)), null);
	assert.equal(openSession(undefined, undefined), null);
	assert.throws(() => sealSession(alice, 'short'), /SESSION_SECRET/);
});

test('return destinations stay local and avoid authentication loops', () => {
	assert.equal(returnPath('/courses/42?tab=work'), '/courses/42?tab=work');
	for (const value of [
		null,
		'//evil.example',
		'/\\evil.example',
		'https://evil.example',
		'/login?next=x',
		'/logout',
		'/\n/evil.example',
		'/\t/evil.example'
	])
		assert.equal(returnPath(value), '/dashboard');
});

test('Canvas connections require public HTTPS origins', () => {
	assert.equal(canvasOrigin(' https://SCHOOL.instructure.com/ '), 'https://school.instructure.com');
	for (const value of [
		'http://school.instructure.com',
		'https://localhost',
		'https://127.0.0.1',
		'https://[::1]',
		'https://[::ffff:127.0.0.1]',
		'https://169.254.169.254',
		'https://school.instructure.com:8443',
		'https://user:pass@school.instructure.com',
		'https://school.instructure.com/courses',
		'https://school.instructure.com?x=1'
	])
		assert.throws(() => canvasOrigin(value));
});

test('DNS address policy blocks private, reserved, and mapped private addresses', () => {
	for (const address of [
		'127.0.0.1',
		'10.1.2.3',
		'172.16.0.1',
		'192.168.0.1',
		'169.254.169.254',
		'100.64.0.1',
		'0.0.0.0',
		'224.0.0.1',
		'::1',
		'fc00::1',
		'fe80::1',
		'::ffff:10.0.0.1',
		'2001:db8::1'
	])
		assert.equal(publicAddress(address), false, address);
	assert.equal(publicAddress('1.1.1.1'), true);
	assert.equal(publicAddress('2606:4700:4700::1111'), true);
});
