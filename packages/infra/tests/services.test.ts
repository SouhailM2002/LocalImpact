import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { LocalFileStorage, ScryptPasswordHasher } from "../src/index.js";

describe("ScryptPasswordHasher", () => {
  it("hashes passwords and verifies only the matching value", async () => {
    const hasher = new ScryptPasswordHasher();
    const hash = await hasher.hash("correct horse battery staple");

    expect(hash).not.toContain("correct horse battery staple");
    await expect(hasher.verify("correct horse battery staple", hash)).resolves.toBe(true);
    await expect(hasher.verify("wrong password", hash)).resolves.toBe(false);
    await expect(hasher.verify("anything", "not-a-valid-hash")).resolves.toBe(false);
  });
});

describe("LocalFileStorage", () => {
  it("stores image bytes under a generated file name", async () => {
    const directory = await mkdtemp(join(tmpdir(), "localimpact-upload-"));
    const storage = new LocalFileStorage(directory);
    const content = new Uint8Array([1, 2, 3]);

    try {
      const url = await storage.store({
        fileName: "../../unsafe.jpg",
        contentType: "image/jpeg",
        content,
      });

      expect(url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);
      await expect(
        readFile(join(directory, url.slice("/uploads/".length))),
      ).resolves.toEqual(Buffer.from(content));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("rejects unsupported image media types", async () => {
    const storage = new LocalFileStorage();

    await expect(storage.store({
      fileName: "payload.svg",
      contentType: "image/svg+xml",
      content: new Uint8Array([1]),
    })).rejects.toThrow("Photo must be a JPEG, PNG, WebP, or AVIF image.");
  });
});
