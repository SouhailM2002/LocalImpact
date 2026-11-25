CREATE TYPE "NotificationType" AS ENUM ('REPORT_SUPPORTED');

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "signalementId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "signalementTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_recipientId_createdAt_idx"
    ON "Notification"("recipientId", "createdAt");
CREATE INDEX "Notification_recipientId_readAt_createdAt_idx"
    ON "Notification"("recipientId", "readAt", "createdAt");

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_signalementId_fkey" FOREIGN KEY ("signalementId")
    REFERENCES "Signalement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
