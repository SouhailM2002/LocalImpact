import type { NewNotificationRecord, NotificationDto } from "../dto.js";

export interface NotificationRepository {
  create(notification: NewNotificationRecord): Promise<void>;
  findForRecipient(
    recipientId: string,
    limit?: number,
  ): Promise<readonly NotificationDto[]>;
  countUnreadForRecipient(recipientId: string): Promise<number>;
  markAsRead(
    notificationId: string,
    recipientId: string,
    readAt: Date,
  ): Promise<string | null>;
}
