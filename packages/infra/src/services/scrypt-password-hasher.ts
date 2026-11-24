import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import type { PasswordHasher } from "@localimpact/application";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await deriveKey(password, salt);
    return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    const [algorithm, saltValue, keyValue, ...extra] = passwordHash.split("$");
    if (
      algorithm !== "scrypt" ||
      saltValue === undefined ||
      keyValue === undefined ||
      extra.length > 0
    ) {
      return false;
    }

    const salt = Buffer.from(saltValue, "base64url");
    const expectedKey = Buffer.from(keyValue, "base64url");
    if (
      salt.length !== SALT_LENGTH ||
      expectedKey.length !== KEY_LENGTH ||
      salt.toString("base64url") !== saltValue ||
      expectedKey.toString("base64url") !== keyValue
    ) {
      return false;
    }

    const actualKey = await deriveKey(password, salt);
    return timingSafeEqual(actualKey, expectedKey);
  }
}
