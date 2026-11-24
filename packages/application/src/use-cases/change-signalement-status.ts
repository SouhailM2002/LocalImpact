import {
  SignalementId,
  SignalementNotFoundError,
  Statut,
  UnauthorizedDomainOperationError,
} from "@localimpact/domain";
import type { ActorContext, HistoriqueStatutDto, SignalementDto } from "../dto.js";
import { toHistoriqueStatutDto, toSignalementDto } from "../dto.js";
import type { Clock } from "../ports/clock.js";
import type { HistoriqueRepository } from "../ports/historique-repository.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import type { TransactionManager } from "../ports/transaction-manager.js";

export interface ChangeSignalementStatusInput {
  readonly actor: ActorContext;
  readonly signalementId: string;
  readonly newStatus: string;
  readonly interventionDescription?: string;
}

export interface ChangeSignalementStatusOutput {
  readonly signalement: SignalementDto;
  readonly history: HistoriqueStatutDto;
}

export class ChangeSignalementStatus {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly histories: HistoriqueRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: ChangeSignalementStatusInput): Promise<ChangeSignalementStatusOutput> {
    if (input.actor.role !== "RESPONSABLE" && input.actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("change report status", input.actor.role);
    }

    return this.transactionManager.run(async () => {
      const signalementId = SignalementId.create(input.signalementId);
      const signalement = await this.signalements.findById(signalementId);
      if (signalement === null) {
        throw new SignalementNotFoundError(signalementId.value);
      }
      if (
        input.actor.role === "RESPONSABLE" &&
        signalement.assignedResponsableId !== input.actor.userId
      ) {
        throw new UnauthorizedDomainOperationError("change status of an unassigned report", input.actor.role);
      }

      const history = signalement.transitionTo({
        historyId: this.ids.next(),
        newStatus: Statut.from(input.newStatus),
        authorId: input.actor.userId,
        authorRole: input.actor.role,
        changedAt: this.clock.now(),
        interventionDescription: input.interventionDescription,
      });

      await this.signalements.save(signalement);
      await this.histories.create(history);

      return {
        signalement: toSignalementDto(signalement),
        history: toHistoriqueStatutDto(history),
      };
    });
  }
}
