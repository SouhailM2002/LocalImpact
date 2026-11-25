import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));

export default async function globalTeardown(): Promise<void> {
  const isWindows = process.platform === "win32";
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      isWindows ? process.env.ComSpec ?? "cmd.exe" : "docker",
      isWindows
        ? ["/d", "/s", "/c", "docker compose -f docker-compose.e2e.yml down --volumes --remove-orphans"]
        : ["compose", "-f", "docker-compose.e2e.yml", "down", "--volumes", "--remove-orphans"],
      {
        cwd: workspaceRoot,
        env: process.env,
        stdio: "inherit",
      },
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Docker Compose teardown exited with code ${code ?? "unknown"}.`));
      }
    });
  });
}
