import {
  DejaSoutenuError,
  SignalementId,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type { ActorContext } from "../dto.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
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
  constructor(private readonly signalements: SignalementRepository) {}

  async execute(input: SupportSignalementInput): Promise<SupportSignalementOutput> {
    if (input.actor.role !== "USER") {
      throw new UnauthorizedDomainOperationError("support a report", input.actor.role);
    }

    const signalementId = SignalementId.create(input.signalementId);
    const userId = requireNonBlank(input.actor.userId, "actor.userId");
    const signalement = await this.signalements.findById(signalementId);
    if (signalement === null) {
      throw new SignalementNotFoundError(signalementId.value);
    }

    const supportCount = await this.signalements.addSupportIfAbsent(
      signalementId,
      userId,
    );
    if (supportCount === null) {
      throw new DejaSoutenuError(userId);
    }

    return {
      signalementId: signalementId.value,
      supportCount,
    };
  }
}
