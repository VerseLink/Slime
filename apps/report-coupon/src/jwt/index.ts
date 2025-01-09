export class JWTManager {

    sign() {

    }

    verify() {

    }

    /** Issues a new / valid certificate to be used */
    async issueCertificate() {

    }

    getCertificates() {

    }

    /** 
     * Invalidates a certificate so that it cannot be used for signing, 
     * but still allow verifying old signed JWT to be validated (issued before invalidation date)
     */
    invalidateCertificate() {

    }

    /**
     * Revokes a certificate so that it cannot be used for signing or verifying JWT tokens,
     * effectively invalidate all JWT signed under this certificate
     */
    revokeCertificate() {

    }
    
}