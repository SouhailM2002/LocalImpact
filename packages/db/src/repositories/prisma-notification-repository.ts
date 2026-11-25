import type { PrismaClient } from "@prisma/client";
import type {
  NewNotificationRecord,
  NotificationDto,
  NotificationRepository,
  NotificationType,
} from "@localimpact/application";
import { getPrismaExecutor } from "../prisma-transaction-context.js";

interface NotificationRow {
  id: string;
  type: NotificationType;
  signalementId: string;
  signalementTitle: string;
  createdAt: Date;
  readAt: Date | null;
}

function toNotificationDto(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    signalementId: row.signalementId,
    signalementTitle: row.signalementTitle,
    createdAt: new Date(row.createdAt.getTime()),
    readAt: row.readAt === null ? undefined : new Date(row.readAt.getTime()),
  };
}

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(notification: NewNotificationRecord): Promise<void> {
    await getPrismaExecutor(this.prisma).$executeRaw`
      INSERT INTO "Notification" (
        "id",
        "recipientId",
        "signalementId",
        "type",
        "signalementTitle",
        "createdAt"
      )
      VALUES (
        ${notification.id},
        ${notification.recipientId},
        ${notification.signalementId},
        CAST(${notification.type} AS "NotificationType"),
        ${notification.signalementTitle},
        ${notification.createdAt}
      )
    `;
  }

  async findForRecipient(
    recipientId: string,
    limit?: number,
  ): Promise<readonly NotificationDto[]> {
    const db = getPrismaExecutor(this.prisma);
    const rows = limit === undefined
      ? await db.$queryRaw<NotificationRow[]>`
          SELECT "id", "type", "signalementId", "signalementTitle", "createdAt", "readAt"
          FROM "Notification"
          WHERE "recipientId" = ${recipientId}
          ORDER BY "createdAt" DESC, "id" ASC
        `
      : await db.$queryRaw<NotificationRow[]>`
          SELECT "id", "type", "signalementId", "signalementTitle", "createdAt", "readAt"
          FROM "Notification"
          WHERE "recipientId" = ${recipientId}
          ORDER BY "createdAt" DESC, "id" ASC
          LIMIT ${limit}
        `;

    return Object.freeze(rows.map(toNotificationDto));
  }

  async countUnreadForRecipient(recipientId: string): Promise<number> {
    const rows = await getPrismaExecutor(this.prisma).$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) AS "count"
      FROM "Notification"
      WHERE "recipientId" = ${recipientId} AND "readAt" IS NULL
    `;
    const row = rows[0];
    if (row === undefined) {
      throw new Error("The notification unread count query returned no result.");
    }

    return Number(row.count);
  }

  async markAsRead(
    notificationId: string,
    recipientId: string,
    readAt: Date,
  ): Promise<string | null> {
    const db = getPrismaExecutor(this.prisma);
    const rows = await db.$queryRaw<Array<{ signalementId: string }>>`
      SELECT "signalementId"
      FROM "Notification"
      WHERE "id" = ${notificationId} AND "recipientId" = ${recipientId}
    `;
    const notification = rows[0];
    if (notification === undefined) {
      return null;
    }

    await db.$executeRaw`
      UPDATE "Notification"
      SET "readAt" = COALESCE("readAt", ${readAt})
      WHERE "id" = ${notificationId} AND "recipientId" = ${recipientId}
    `;

    return notification.signalementId;
  }
}
