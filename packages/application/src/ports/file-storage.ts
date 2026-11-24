import type { PhotoUpload } from "../dto.js";

export interface FileStorage {
  store(file: PhotoUpload): Promise<string>;
}
