import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const packageDirectory = fileURLToPath(new URL(".", import.meta.url));

config({ path: resolve(packageDirectory, "../../.env") });

export default defineConfig({
  schema: resolve(packageDirectory, "prisma/schema.prisma"),
});
