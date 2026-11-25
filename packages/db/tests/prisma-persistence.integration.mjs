import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import { test } from "node:test";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { createPrismaPersistence } from "../dist/index.js";
import { Signalement, SignalementId } from "@localimpact/domain";

const packageDirectory = fileURLToPath(new URL("..", import.meta.url));

test("Prisma persistence migrates PostgreSQL and round-trips report metadata", async () => {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const databaseUrl = container.getConnectionUri();
  const isWindows = process.platform === "win32";
  const migration = spawnSync(
    isWindows ? process.env.ComSpec ?? "cmd.exe" : "pnpm",
    isWindows
      ? ["/d", "/s", "/c", "pnpm exec prisma migrate deploy --config prisma.config.ts"]
      : ["exec", "prisma", "migrate", "deploy", "--config", "prisma.config.ts"],
    {
      cwd: packageDirectory,
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    },
  );

  if (migration.status !== 0) {
    await container.stop();
    throw new Error(
      `Could not apply Prisma migrations:\n${migration.stdout}\n${migration.stderr}`,
    );
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const user = await prisma.user.create({
      data: {
        id: "integration-user",
        name: "Integration User",
        email: "integration-user@example.test",
      },
    });
    const persistence = createPrismaPersistence(
      { now: () => new Date("2026-01-02T03:04:05.000Z") },
      prisma,
    );
    const report = Signalement.create({
      id: SignalementId.create("integration-report"),
      title: "Blocked accessible entrance",
      description: "The accessible entrance is blocked.",
      category: "Accessibilité",
      location: "Building A",
      latitude: 36.8665,
      longitude: 10.1647,
      accessibilityBarrierType: "INACCESSIBLE_ENTRY",
      accessibilityImpact: "MOBILITY",
      accessibilityUrgency: "HIGH",
      creatorId: user.id,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await persistence.signalements.create(report);
    const loaded = await persistence.signalements.findById(report.id);

    assert.ok(loaded);
    assert.equal(loaded.latitude, 36.8665);
    assert.equal(loaded.longitude, 10.1647);
    assert.equal(loaded.accessibilityBarrierType, "INACCESSIBLE_ENTRY");
    assert.equal(loaded.accessibilityImpact, "MOBILITY");
    assert.equal(loaded.accessibilityUrgency, "HIGH");
    assert.deepEqual(
      await persistence.signalements.findAll({
        accessibilityOnly: true,
        accessibilityImpact: "MOBILITY",
        accessibilityUrgency: "HIGH",
        page: 1,
        pageSize: 1,
      }),
      [loaded],
    );
  } finally {
    await prisma.$disconnect();
    await container.stop();
  }
});
