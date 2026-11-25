import type { Clock } from "../ports/clock.js";
import type { NotificationRepository } from "../ports/notification-repository.js";
import { NotificationNotFoundError } from "../errors/application-error.js";
import { requireNonBlank } from "./application-validation.js";

export interface MarkNotificationAsReadInput {
  readonly notificationId: string;
  readonly userId: string;
}

export class MarkNotificationAsRead {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: MarkNotificationAsReadInput): Promise<string> {
    const notificationId = requireNonBlank(input.notificationId, "notificationId");
    const userId = requireNonBlank(input.userId, "userId");
    const signalementId = await this.notifications.markAsRead(
      notificationId,
      userId,
      this.clock.now(),
    );
    if (signalementId === null) {
      throw new NotificationNotFoundError(notificationId);
    }

    return signalementId;
  }
}
