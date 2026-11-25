import type {
  NewNotificationRecord,
  NotificationDto,
  NotificationRepository,
} from "@localimpact/application";
import { InMemoryRepositoryError } from "../errors/in-memory-repository-error.js";

interface StoredNotification extends NotificationDto {
  readonly recipientId: string;
}

function copyNotification(notification: StoredNotification): StoredNotification {
  return {
    ...notification,
    createdAt: new Date(notification.createdAt.getTime()),
    readAt: notification.readAt === undefined
      ? undefined
      : new Date(notification.readAt.getTime()),
  };
}

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications = new Map<string, StoredNotification>();

  create(notification: NewNotificationRecord): Promise<void> {
    if (this.notifications.has(notification.id)) {
      return Promise.reject(new InMemoryRepositoryError(
        "RECORD_ALREADY_EXISTS",
        `A notification with ID ${notification.id} already exists.`,
      ));
    }

    this.notifications.set(notification.id, {
      ...notification,
      recipientId: notification.recipientId,
      readAt: undefined,
    });
    return Promise.resolve();
  }

  findForRecipient(
    recipientId: string,
    limit?: number,
  ): Promise<readonly NotificationDto[]> {
    const notifications = [...this.notifications.values()]
      .filter((notification) => notification.recipientId === recipientId)
      .sort((left, right) => (
        right.createdAt.getTime() - left.createdAt.getTime() ||
        left.id.localeCompare(right.id)
      ))
      .slice(0, limit)
      .map((notification) => {
        const copy = copyNotification(notification);
        return {
          id: copy.id,
          type: copy.type,
          signalementId: copy.signalementId,
          signalementTitle: copy.signalementTitle,
          createdAt: copy.createdAt,
          readAt: copy.readAt,
        };
      });

    return Promise.resolve(Object.freeze(notifications));
  }

  countUnreadForRecipient(recipientId: string): Promise<number> {
    return Promise.resolve([...this.notifications.values()].filter((notification) => (
      notification.recipientId === recipientId && notification.readAt === undefined
    )).length);
  }

  markAsRead(
    notificationId: string,
    recipientId: string,
    readAt: Date,
  ): Promise<string | null> {
    const notification = this.notifications.get(notificationId);
    if (notification === undefined || notification.recipientId !== recipientId) {
      return Promise.resolve(null);
    }

    this.notifications.set(notificationId, {
      ...notification,
      readAt: notification.readAt ?? new Date(readAt.getTime()),
    });
    return Promise.resolve(notification.signalementId);
  }
}
