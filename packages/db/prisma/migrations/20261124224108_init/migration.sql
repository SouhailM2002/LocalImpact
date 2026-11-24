-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'RESPONSABLE', 'ADMIN');

-- CreateEnum
CREATE TYPE "SignalementStatus" AS ENUM ('NOUVEAU', 'PRIS_EN_CHARGE', 'EN_COURS', 'RESOLU');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signalement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "SignalementStatus" NOT NULL DEFAULT 'NOUVEAU',
    "creatorId" TEXT NOT NULL,
    "responsableId" TEXT,
    "interventionDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Signalement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soutien" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Soutien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" TEXT NOT NULL,
    "signalementId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "previousStatus" "SignalementStatus" NOT NULL,
    "newStatus" "SignalementStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" TEXT NOT NULL,
    "signalementId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Signalement_title_idx" ON "Signalement"("title");

-- CreateIndex
CREATE INDEX "Signalement_category_status_idx" ON "Signalement"("category", "status");

-- CreateIndex
CREATE INDEX "Signalement_location_status_idx" ON "Signalement"("location", "status");

-- CreateIndex
CREATE INDEX "Signalement_status_createdAt_idx" ON "Signalement"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Signalement_creatorId_idx" ON "Signalement"("creatorId");

-- CreateIndex
CREATE INDEX "Signalement_responsableId_status_idx" ON "Signalement"("responsableId", "status");

-- CreateIndex
CREATE INDEX "Signalement_resolvedAt_idx" ON "Signalement"("resolvedAt");

-- CreateIndex
CREATE INDEX "Soutien_signalementId_idx" ON "Soutien"("signalementId");

-- CreateIndex
CREATE UNIQUE INDEX "Soutien_userId_signalementId_key" ON "Soutien"("userId", "signalementId");

-- CreateIndex
CREATE INDEX "Historique_signalementId_createdAt_idx" ON "Historique"("signalementId", "createdAt");

-- CreateIndex
CREATE INDEX "Historique_authorId_idx" ON "Historique"("authorId");

-- CreateIndex
CREATE INDEX "Commentaire_signalementId_createdAt_idx" ON "Commentaire"("signalementId", "createdAt");

-- CreateIndex
CREATE INDEX "Commentaire_authorId_idx" ON "Commentaire"("authorId");

-- AddForeignKey
ALTER TABLE "Signalement" ADD CONSTRAINT "Signalement_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signalement" ADD CONSTRAINT "Signalement_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soutien" ADD CONSTRAINT "Soutien_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soutien" ADD CONSTRAINT "Soutien_signalementId_fkey" FOREIGN KEY ("signalementId") REFERENCES "Signalement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_signalementId_fkey" FOREIGN KEY ("signalementId") REFERENCES "Signalement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_signalementId_fkey" FOREIGN KEY ("signalementId") REFERENCES "Signalement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
