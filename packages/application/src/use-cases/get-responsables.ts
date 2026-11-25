import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import type { ActorContext, UserDisplayName } from "../dto.js";
import type { UserRepository } from "../ports/user-repository.js";

export class GetResponsables {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: ActorContext): Promise<readonly UserDisplayName[]> {
    if (actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("view responsable accounts", actor.role);
    }

    return this.users.findDisplayNamesByRole("RESPONSABLE");
  }
}
