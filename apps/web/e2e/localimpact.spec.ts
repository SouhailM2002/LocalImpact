import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { prisma } from "@localimpact/db";

test("members create accessible reports; admins can paginate reports and roles", async ({ page }) => {
  const suffix = randomUUID();
  const email = `e2e-${suffix}@example.test`;
  const password = "LocalImpactE2E-Password-123!";
  const reportTitle = `E2E accessible report ${suffix}`;
  const comment = `E2E comment ${suffix}`;

  await page.goto("/register");
  await page.getByLabel("Nom complet").fill("E2E Administrator");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByLabel("Confirmer le mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/reports$/);

  await page.goto("/reports/new");
  await page.getByLabel("Titre").fill(reportTitle);
  await page.getByLabel("Description").fill("An accessible path is blocked near the main entrance.");
  await page.getByLabel("Catégorie").fill("Accessibilité");
  await page.getByLabel("Lieu").fill("Ariana Campus");
  await page.getByLabel("Latitude").fill("36.8665");
  await page.getByLabel("Longitude").fill("10.1647");
  await page.getByLabel("Ce signalement concerne un obstacle d’accessibilité").check();
  await page.getByLabel("Type d’obstacle").selectOption("BLOCKED_PATH");
  await page.getByLabel("Impact", { exact: true }).selectOption("MOBILITY");
  await page.getByLabel("Urgence").selectOption("HIGH");
  await page.getByRole("button", { name: "Créer le signalement" }).click();
  await expect(page).toHaveURL(/\/reports\/[^/]+\?created=1$/);
  await expect(page.getByRole("heading", { name: reportTitle })).toBeVisible();

  await page.getByLabel("Votre commentaire").fill(comment);
  await page.getByRole("button", { name: "Publier le commentaire" }).click();
  await expect(page.getByText(comment)).toBeVisible();

  const user = await prisma.user.findUnique({ where: { email } });
  expect(user).not.toBeNull();
  if (user === null) {
    throw new Error("The newly registered E2E account was not persisted.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });
  await prisma.user.createMany({
    data: Array.from({ length: 10 }, (_, index) => ({
      id: `e2e-role-${suffix}-${index}`,
      name: `ZZZ E2E Role ${index.toString().padStart(2, "0")}`,
      email: `e2e-role-${suffix}-${index}@example.test`,
      role: "USER" as const,
    })),
  });
  await prisma.signalement.createMany({
    data: Array.from({ length: 13 }, (_, index) => ({
      id: `e2e-report-${suffix}-${index}`,
      title: `E2E Pagination ${index.toString().padStart(2, "0")}`,
      description: "Report created to verify community pagination.",
      category: "E2E",
      location: "Pagination Test Campus",
      creatorId: user.id,
      createdAt: new Date(Date.now() - index * 1_000),
    })),
  });

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/reports$/);

  await page.goto("/admin");
  const rolesPagination = page.getByRole("navigation", { name: "Pagination des comptes" });
  await expect(rolesPagination).toContainText("Page 1 sur 2");
  await rolesPagination.getByRole("button", { name: "Suivant" }).click();
  await expect(rolesPagination).toContainText("Page 2 sur 2");

  await page.goto("/reports");
  await page.getByLabel("Recherche", { exact: true }).fill("E2E Pagination");
  await page.getByRole("button", { name: "Appliquer" }).click();
  await expect(page.getByRole("navigation", { name: "Pagination des signalements" }))
    .toContainText("Page 1 sur 2");
  await page.getByRole("link", { name: "Suivant" }).click();
  await expect(page).toHaveURL(/keyword=E2E\+Pagination.*page=2/);
  await expect(page.getByRole("navigation", { name: "Pagination des signalements" }))
    .toContainText("Page 2 sur 2");
});
