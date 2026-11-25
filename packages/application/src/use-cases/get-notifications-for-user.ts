import type { NotificationFeedDto } from "../dto.js";
import { ApplicationValidationError } from "../errors/application-error.js";
import type { NotificationRepository } from "../ports/notification-repository.js";
import { requireNonBlank } from "./application-validation.js";

export interface GetNotificationsForUserInput {
  readonly userId: string;
  readonly limit?: number;
}

export class GetNotificationsForUser {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(input: GetNotificationsForUserInput): Promise<NotificationFeedDto> {
    const userId = requireNonBlank(input.userId, "userId");
    if (
      input.limit !== undefined &&
      (!Number.isSafeInteger(input.limit) || input.limit < 1)
    ) {
      throw new ApplicationValidationError("limit", "A positive notification limit is required.");
    }

    const [notifications, unreadCount] = await Promise.all([
      this.notifications.findForRecipient(userId, input.limit),
      this.notifications.countUnreadForRecipient(userId),
    ]);

    return { notifications, unreadCount };
  }
}
