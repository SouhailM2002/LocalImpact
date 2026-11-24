import {
  SignalementId,
  SignalementNotFoundError,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type { ActorContext, SignalementDto } from "../dto.js";
import { toSignalementDto } from "../dto.js";
import {
  ApplicationValidationError,
  UserNotFoundError,
} from "../errors/application-error.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import type { UserRepository } from "../ports/user-repository.js";
import { requireNonBlank } from "./application-validation.js";

export interface AssignResponsableInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
  readonly responsableId: string;
}

export class AssignResponsable {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(input: AssignResponsableInput): Promise<SignalementDto> {
    if (input.actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("assign a responsable", input.actor.role);
    }

    const signalementId = SignalementId.create(input.signalementId);
    const responsableId = requireNonBlank(input.responsableId, "responsableId");
    const signalement = await this.signalements.findById(signalementId);
    if (signalement === null) {
      throw new SignalementNotFoundError(signalementId.value);
    }

    const responsable = await this.users.findById(responsableId);
    if (responsable === null) {
      throw new UserNotFoundError(responsableId);
    }
    if (responsable.role !== "RESPONSABLE") {
      throw new ApplicationValidationError(
        "responsableId",
        "The assigned account must have the RESPONSABLE role.",
      );
    }

    signalement.assignToResponsable(responsable.id);
    await this.signalements.save(signalement);

    return toSignalementDto(signalement);
  }
}
