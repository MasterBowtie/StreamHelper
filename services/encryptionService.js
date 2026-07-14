import crypto from "node:crypto";

export function buildEncryptionService({key}) {
    if (!key) {
        throw new Error("Missing ENCRYPTION_KEY");
    }

    const encryptionKey = Buffer.from(key, "hex");

    if (encryptionKey.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
    }
    const ALGORITHM = "aes-256-gcm";
    const IV_LENGTH = 12; // Recommended for GCM
    const AUTH_TAG_LENGTH = 16;

    function encrypt(plainText) {
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(
            ALGORITHM,
            encryptionKey,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(plainText, "utf8"),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        return Buffer.concat([
            iv,
            authTag,
            encrypted
        ]).toString("base64");
    }

    function decrypt(cipherText) {
        const buffer = Buffer.from(cipherText, "base64");

        const iv = buffer.subarray(0, IV_LENGTH);
        
        const authTag = buffer.subarray(
            IV_LENGTH,
            IV_LENGTH + AUTH_TAG_LENGTH
        );

        const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);

        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted.toString("utf8")
    }

    return {
        encrypt,
        decrypt
    }
}