// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index';
import { JWTManager } from '../src/jwt/index';
import { v7 } from 'uuid';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Hello World worker', () => {
	it('responds with Hello World! (unit style)', async () => {
		const request = new IncomingRequest('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).equal(404);
	});

	it('responds with Hello World! (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(response.status).equal(404);
	});
});

describe('JWT test', () => {

	it('issueCertificate', async () => {
		const jwtManager = new JWTManager(env, { defaultExpirySeconds: 10 });
		const certificate = await jwtManager.issueCertificate(new Date("2025-1-15Z"));
		expect(certificate).toMatchObject({
			isReadOnly: false,
			isRevoked: false,
			expireAt: new Date("2025-1-15Z").getTime()
		});
	});

});

describe('JWTManager', () => {
	let jwtManager: JWTManager;

	beforeEach(() => {
		jwtManager = new JWTManager(env, { defaultExpirySeconds: 3600 }); // 默認 1 小時過期
	});

	it('should issue a certificate', async () => {
		const cert = await jwtManager.issueCertificate();

		expect(cert).toHaveProperty('id');
		expect(cert).toHaveProperty('privateKey');
		expect(cert).toHaveProperty('publicKey');
		expect(cert).toHaveProperty('expireAt');
		expect(cert.isReadOnly).toBe(false);
		expect(cert.isRevoked).toBe(false);
	});

	it('should issue a certificate and can be retrieved', async () => {
		const cert = await jwtManager.issueCertificate();
		const pool = await jwtManager.getCertificates();

		expect(pool.some(x => x.id === cert.id)).toBe(true);
	});

	it('should get newest certificate', async () => {
		await jwtManager.issueCertificate();
		await jwtManager.issueCertificate();
		const newCert = await jwtManager.issueCertificate();
		
		const cert = await jwtManager.getCertificates({ limit: 1 });
		const certs = await jwtManager.getCertificates();
		expect(cert).length(1);
		expect(certs).length(3);
		expect(cert[0].id).equal(newCert.id);
	});

	it('should sign and verify a token', async () => {
		const cert = await jwtManager.issueCertificate();
		const payload = {
			iss: "BUGubird"
		};

		const token = await jwtManager.sign(payload, cert.id);

		expect(token).toBeDefined();

		const isValid = await jwtManager.verify(token);
		expect(isValid).toBe(true);
	});

	it('should return false for revoked certificates', async () => {
		const cert = await jwtManager.issueCertificate();
		const payload = {
			iss: "BUGubird"
		};
		const token = await jwtManager.sign(payload, cert.id);

		await jwtManager.revokeCertificate(cert.id);

		const isValid = await jwtManager.verify(token);
		expect(isValid).toBe(false);
	});

	it('should invalidate a certificate', async () => {
		const cert = await jwtManager.issueCertificate();
		await jwtManager.issueCertificate();
		expect((await jwtManager.getCertificates())).length(2);
		
		await jwtManager.invalidateCertificate(cert.id);

		const certs = await jwtManager.getCertificates();
		const invalidCerts = certs.filter(x => x.isReadOnly);
		expect(invalidCerts).length(1);
	});

	it('should retrieve all certificates', async () => {
		await jwtManager.issueCertificate();
		await jwtManager.issueCertificate();

		const certs = await jwtManager.getCertificates();
		expect(certs.length).toBeGreaterThanOrEqual(2);
	});

	it('should handle expired tokens correctly', async () => {
		jwtManager = new JWTManager(env, { defaultExpirySeconds: 0.5 }); // 0.5 秒過期
		const cert = await jwtManager.issueCertificate();
		const payload = {
			iss: "BUGubird"
		};
		const token = await jwtManager.sign(payload, cert.id);

		expect(token).toBeDefined();

		const isValid = await jwtManager.verify(token);
		expect(isValid).toBe(true);
		expect(cert.expireAt).toBe(cert.issuedAt + 0.5 * 1000);
	});

	it('should throw an error when signing with an invalid certificateId', async () => {
		const payload = {
			iss: "BUGubird"
		};
		await expect(
			jwtManager.sign(payload, 'nonexistent-cert-id')
		).rejects.toThrow('Certificate not found');
	});

	it('should correctly save and retrieve certificates in KV store', async () => {
		const cert = await jwtManager.issueCertificate();
		const retrievedCerts = await jwtManager.getCertificates();

		expect(retrievedCerts.some(c => c.id === cert.id)).toBe(true);
	});

	it('should handle edge cases with empty payload', async () => {
		const cert = await jwtManager.issueCertificate();
		const token = await jwtManager.sign({}, cert.id);
		expect(token).toBeDefined();

		const isValid = await jwtManager.verify(token);
		expect(isValid).toBe(true);
	});

	it('should not verify tokens signed with a revoke certificate', async () => {
		const cert1 = await jwtManager.issueCertificate();
		const cert2 = await jwtManager.issueCertificate();
		const payload = {
			iss: "BUGubird"
		};

		const token1 = await jwtManager.sign(payload, cert1.id);
		const token2 = await jwtManager.sign(payload, cert1.id);

		await jwtManager.revokeCertificate(cert1.id);

		const isValid1 = await jwtManager.verify(token1);
		const isValid2 = await jwtManager.verify(token2);

		expect(isValid1).toBe(false);
		expect(isValid2).toBe(true);
	});
	
});
