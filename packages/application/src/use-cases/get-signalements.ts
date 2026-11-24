import type { SignalementDto, SignalementSearchQuery } from "../dto.js";
import type { ActorContext } from "../dto.js";
import { toSignalementDto } from "../dto.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import { ApplicationValidationError } from "../errors/application-error.js";
import { Statut, UnauthorizedDomainOperationError } from "@localimpact/domain";
import { requireNonBlank } from "./application-validation.js";

export interface GetSignalementsInput {
  readonly actor: ActorContext;
  readonly query?: SignalementSearchQuery;
}

export class GetSignalements {
  constructor(private readonly signalements: SignalementRepository) {}

  async execute(input: GetSignalementsInput): Promise<readonly SignalementDto[]> {
    const suppliedQuery = input.query ?? {};
    const query: SignalementSearchQuery = {
      ...(suppliedQuery.keyword === undefined
        ? {}
        : { keyword: requireNonBlank(suppliedQuery.keyword, "keyword") }),
      ...(suppliedQuery.category === undefined
        ? {}
        : { category: requireNonBlank(suppliedQuery.category, "category") }),
      ...(suppliedQuery.location === undefined
        ? {}
        : { location: requireNonBlank(suppliedQuery.location, "location") }),
      ...(suppliedQuery.status === undefined ? {} : { status: suppliedQuery.status }),
      ...(suppliedQuery.assignedResponsableId === undefined
        ? {}
        : {
            assignedResponsableId: requireNonBlank(
              suppliedQuery.assignedResponsableId,
              "assignedResponsableId",
            ),
          }),
      ...(suppliedQuery.page === undefined ? {} : { page: suppliedQuery.page }),
      ...(suppliedQuery.pageSize === undefined ? {} : { pageSize: suppliedQuery.pageSize }),
    };
    if (
      input.actor.role !== "USER" &&
      input.actor.role !== "RESPONSABLE" &&
      input.actor.role !== "ADMIN"
    ) {
      throw new UnauthorizedDomainOperationError("browse reports", input.actor.role);
    }

    const assignedResponsableId = input.actor.role === "RESPONSABLE"
      ? requireNonBlank(input.actor.userId, "actor.userId")
      : query.assignedResponsableId;
    if (query.page !== undefined && (!Number.isInteger(query.page) || query.page < 1)) {
      throw new ApplicationValidationError("page", "Page must be a positive integer.");
    }
    if (
      query.pageSize !== undefined &&
      (!Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100)
    ) {
      throw new ApplicationValidationError("pageSize", "Page size must be between 1 and 100.");
    }
    if (query.status !== undefined) {
      Statut.from(query.status);
    }

    const effectiveQuery = input.actor.role === "RESPONSABLE"
      ? { ...query, assignedResponsableId }
      : query;
    const results = await this.signalements.findAll(effectiveQuery);
    const visibleResults = input.actor.role === "RESPONSABLE"
      ? results.filter((signalement) => signalement.assignedResponsableId === assignedResponsableId)
      : results;
    return visibleResults.map(toSignalementDto);
  }
}
