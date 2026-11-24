import {
  SignalementId,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type { ActorContext, SignalementDto } from "../dto.js";
import { toSignalementDto } from "../dto.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";

export interface GetSignalementByIdInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
}

export class GetSignalementById {
  constructor(private readonly signalements: SignalementRepository) {}

  async execute(input: GetSignalementByIdInput): Promise<SignalementDto> {
    if (
      input.actor.role !== "USER" &&
      input.actor.role !== "RESPONSABLE" &&
      input.actor.role !== "ADMIN"
    ) {
      throw new UnauthorizedDomainOperationError("view a report", input.actor.role);
    }

    const signalementId = SignalementId.create(input.signalementId);
    const signalement = await this.signalements.findById(signalementId);
    if (signalement === null) {
      throw new SignalementNotFoundError(signalementId.value);
    }
    if (
      input.actor.role === "RESPONSABLE" &&
      signalement.assignedResponsableId !== input.actor.userId
    ) {
      throw new UnauthorizedDomainOperationError("view an unassigned report", input.actor.role);
    }

    return toSignalementDto(signalement);
  }
}
