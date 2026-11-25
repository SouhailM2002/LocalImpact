import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const databaseDirectory = fileURLToPath(new URL("../../../packages/db/", import.meta.url));

function run(command: string, args: readonly string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const child = spawn(
      isWindows ? process.env.ComSpec ?? "cmd.exe" : command,
      isWindows ? ["/d", "/s", "/c", [command, ...args].join(" ")] : args,
      {
        cwd,
        env: process.env,
        stdio: "inherit",
      },
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code ?? "unknown"}.`));
      }
    });
  });
}

export default async function globalSetup(): Promise<void> {
  try {
    await run("docker", ["compose", "-f", "docker-compose.e2e.yml", "up", "-d", "--wait"], workspaceRoot);
    await run(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      ["exec", "prisma", "migrate", "deploy", "--config", "prisma.config.ts"],
      databaseDirectory,
    );
  } catch (error) {
    try {
      await run(
        "docker",
        ["compose", "-f", "docker-compose.e2e.yml", "down", "--volumes", "--remove-orphans"],
        workspaceRoot,
      );
    } catch (cleanupError) {
      throw new AggregateError(
        [error],
        "E2E setup failed and its PostgreSQL container could not be removed.",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}
