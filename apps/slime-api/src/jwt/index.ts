import jwt, { JwtPayload } from "@tsndr/cloudflare-worker-jwt";
import { v7 as uuidV7 } from "uuid";

export interface Certificate {
    id: string;
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
    isReadOnly: boolean;
    isRevoked: boolean;
    issuedAt: number;
    expireAt: number;
}

const certPrefix = "cert:";

export class JWTManager {
    private kvStore: KVNamespace;
    private defaultExpirySeconds: number;

    constructor(env: Env, options?: { defaultExpirySeconds?: number }) {
        this.kvStore = env.JWT_KEY_KV_STORE;
        this.defaultExpirySeconds = options?.defaultExpirySeconds ?? 262980;//262980一個月的總秒數
    }

    async sign<T>(payload: JwtPayload<T>, certificateId?: string): Promise<string> {
        let certificate: Certificate | null;

        if (certificateId != null) {
            certificate = await this.getCertificateById(certificateId);
            if (certificate == null)
                throw new Error("Certificate not found");
            if (certificate.isReadOnly || certificate.isRevoked || certificate.expireAt < Date.now())
                throw new Error("Certificate was expired or revoked");
        }
        else {
            const certificates = await this.getCertificates({
                filter: cert => !cert.isReadOnly && !cert.isRevoked && cert.expireAt > Date.now(),
                limit: 1
            });
            certificate = certificates[0];
        }

        certificate ??= await this.issueCertificate();
        return await jwt.sign(payload, certificate.privateKey, { algorithm: "RS256", header: { kid: certificate.id } });
    }

    async verify(token: string): Promise<boolean> {
        const value = jwt.decode<object, { kid?: string }>(token);
        const kid = value.header?.kid;
        if (kid == null)
            return false;
        const cert = await this.getCertificateById(kid);
        if (cert == null || cert.isRevoked)
            return false;
        const result = await jwt.verify(token, cert.publicKey, { algorithm: "RS256" });
        return result != null;
    }

    /** Issues a new / valid certificate to be used */
    async issueCertificate(expireAt?: number | Date): Promise<Certificate> {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['sign', 'verify']
        ) as CryptoKeyPair;

        const createReverseUuidV7 = () => {
            const buffer = new Uint8Array(16);
            const rawId = uuidV7({}, buffer);
            const maxValue = 0xff;
            const reversed = [];
            for (let i = 0; i < rawId.length; ++i) {
                reversed[i] = (maxValue - rawId[i]).toString(16).padStart(2, '0');
            }
            return reversed.join('');
        };

        const id = createReverseUuidV7();
        const privateKey = await crypto.subtle.exportKey('jwk', keyPair.privateKey) as JsonWebKey & { kid: string };
        const publicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey) as JsonWebKey & { kid: string };

        privateKey.kid = id;
        publicKey.kid = id;

        const certificate: Certificate = {
            id,
            privateKey,
            publicKey,
            isReadOnly: false,
            isRevoked: false,
            issuedAt: Date.now(),
            expireAt: expireAt == null ? Date.now() + this.defaultExpirySeconds * 1000 :
                typeof expireAt === "number" ? expireAt : expireAt.getTime()
        };

        await this.kvStore.put(`${certPrefix}${certificate.id}`, JSON.stringify(certificate));
        return certificate;
    }

    async getCertificates(options?: { filter?: (cert: Readonly<Certificate>) => boolean, limit?: number }) {
        this.getCertificates({ 
            filter: function (cert) { 
                return cert.isReadOnly; 
            } 
        });
        let query: KVNamespaceListResult<unknown, string>;
        let cursor: string | null = null;
        const certificates = [];
        do {
            query = await this.kvStore.list({ prefix: certPrefix, cursor });

            for (const key of query.keys) {
                const cert = await this.kvStore.get<Certificate>(key.name, { type: 'json' });
                if (cert == null)
                    continue;
                if (options?.filter == null || options.filter(cert))
                    certificates.push(cert);
                if (options?.limit != null && certificates.length >= options.limit)
                    break;
            }

            if (!query.list_complete)
                cursor = query.cursor;
        }
        while(!query.list_complete);

        return certificates;
    }

    async getCertificateById(id: string) {
        return await this.kvStore.get<Certificate>(`${certPrefix}${id}`, { type: 'json' });
    }
    /** 
     * Invalidates a certificate so that it cannot be used for signing, 
     * but still allow verifying old signed JWT to be validated (issued before invalidation date)
     */

    async invalidateCertificate(certificateId: string): Promise<void> {
        const certificateJson = await this.kvStore.get(`${certPrefix}${certificateId}`);

        if (!certificateJson) {
            throw new Error(`Certificate not found ${certificateId} ${(await this.kvStore.list()).keys.map(x => x.name).join(" ")}`);
        }

        const certificate: Certificate = JSON.parse(certificateJson);

        if (certificate.isReadOnly) {
            return;
        }

        certificate.isReadOnly = true;

        await this.kvStore.put(`${certPrefix}${certificateId}`, JSON.stringify(certificate));
    }

    /**
     * Revokes a certificate so that it cannot be used for signing or verifying JWT tokens,
     * effectively invalidate all JWT signed under this certificate
     */
    async revokeCertificate(certificateId: string): Promise<void> {
        const certificateJson = await this.kvStore.get(`${certPrefix}${certificateId}`);

        if (!certificateJson) {
            throw new Error('Certificate not found');
        }

        const certificate: Certificate = JSON.parse(certificateJson);

        certificate.isRevoked = true;
        certificate.isReadOnly = true;
        await this.kvStore.put(`${certPrefix}${certificateId}`, JSON.stringify(certificate));
    }

}