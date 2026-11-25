import {
  DejaSoutenuError,
  SignalementId,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import { ApplicationValidationError } from "../errors/application-error.js";
import type { ActorContext } from "../dto.js";
import type { Clock } from "../ports/clock.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { NotificationRepository } from "../ports/notification-repository.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import type { TransactionManager } from "../ports/transaction-manager.js";
import { requireNonBlank } from "./application-validation.js";

export interface SupportSignalementInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
}

export interface SupportSignalementOutput {
  readonly signalementId: string;
  readonly supportCount: number;
}

export class SupportSignalement {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly notifications: NotificationRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly transactions: TransactionManager,
  ) {}

  async execute(input: SupportSignalementInput): Promise<SupportSignalementOutput> {
    if (input.actor.role !== "USER") {
      throw new UnauthorizedDomainOperationError("support a report", input.actor.role);
    }

    const signalementId = SignalementId.create(input.signalementId);
    const userId = requireNonBlank(input.actor.userId, "actor.userId");

    return this.transactions.run(async () => {
      const signalement = await this.signalements.findById(signalementId);
      if (signalement === null) {
        throw new SignalementNotFoundError(signalementId.value);
      }
      if (signalement.creatorId === userId) {
        throw new ApplicationValidationError(
          "signalementId",
          "Vous ne pouvez pas soutenir votre propre signalement.",
        );
      }

      const supportCount = await this.signalements.addSupportIfAbsent(
        signalementId,
        userId,
      );
      if (supportCount === null) {
        throw new DejaSoutenuError(userId);
      }

      if (signalement.creatorId !== userId) {
        await this.notifications.create({
          id: this.ids.next(),
          type: "REPORT_SUPPORTED",
          recipientId: signalement.creatorId,
          signalementId: signalementId.value,
          signalementTitle: signalement.title,
          createdAt: this.clock.now(),
        });
      }

      return {
        signalementId: signalementId.value,
        supportCount,
      };
    });
  }
}
