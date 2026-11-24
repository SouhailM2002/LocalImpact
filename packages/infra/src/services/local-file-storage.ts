import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FileStorage, PhotoUpload } from "@localimpact/application";
import { ApplicationValidationError } from "@localimpact/application";

const imageExtensions = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export class LocalFileStorage implements FileStorage {
  constructor(
    private readonly uploadDirectory = join(process.cwd(), "public", "uploads"),
    private readonly publicUrlPrefix = "/uploads",
  ) {}

  async store(file: PhotoUpload): Promise<string> {
    const extension = imageExtensions.get(file.contentType);
    if (extension === undefined) {
      throw new ApplicationValidationError(
        "photo.contentType",
        "Photo must be a JPEG, PNG, WebP, or AVIF image.",
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.uploadDirectory, { recursive: true });
    await writeFile(join(this.uploadDirectory, fileName), file.content, { flag: "wx" });

    return `${this.publicUrlPrefix}/${fileName}`;
  }
}
