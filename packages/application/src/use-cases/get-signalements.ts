import type {
  ActorContext,
  SignalementSearchQuery,
  SignalementsPageDto,
} from "../dto.js";
import { toSignalementDto } from "../dto.js";
import type { SignalementRepository } from "../ports/signalement-repository.js";
import type { UserRepository } from "../ports/user-repository.js";
import { ApplicationValidationError } from "../errors/application-error.js";
import { Statut, UnauthorizedDomainOperationError } from "@localimpact/domain";
import { requireNonBlank } from "./application-validation.js";

export interface GetSignalementsInput {
  readonly actor: ActorContext;
  readonly query?: SignalementSearchQuery;
}

export class GetSignalements {
  constructor(
    private readonly signalements: SignalementRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(input: GetSignalementsInput): Promise<SignalementsPageDto> {
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
    const requestedPage = suppliedQuery.page ?? 1;
    const pageSize = suppliedQuery.pageSize ?? 20;
    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) {
      throw new ApplicationValidationError("page", "Page must be a positive integer.");
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new ApplicationValidationError("pageSize", "Page size must be between 1 and 100.");
    }
    if (query.status !== undefined) {
      Statut.from(query.status);
    }

    const effectiveQuery = input.actor.role === "RESPONSABLE"
      ? { ...query, assignedResponsableId }
      : query;
    const totalCount = await this.signalements.countAll(effectiveQuery);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const results = await this.signalements.findAll({
      ...effectiveQuery,
      page,
      pageSize,
    });
    const visibleResults = input.actor.role === "RESPONSABLE"
      ? results.filter(
          (signalement) => signalement.assignedResponsableId === assignedResponsableId,
        )
      : results;
    const creatorIds = [...new Set(visibleResults.map((signalement) => signalement.creatorId))];
    const creatorNames = await this.users.findDisplayNames(creatorIds);
    const displayNamesById = new Map(
      creatorNames.map(({ id, displayName }) => [id, displayName]),
    );

    return {
      reports: visibleResults.map((signalement) => ({
        ...toSignalementDto(signalement),
        creatorDisplayName: displayNamesById.get(signalement.creatorId) ?? null,
      })),
      page,
      pageSize,
      totalCount,
      totalPages,
    };
  }
}
