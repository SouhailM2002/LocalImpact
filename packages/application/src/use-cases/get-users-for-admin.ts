import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import type { ActorContext, AdminUserSummaryDto } from "../dto.js";
import type { UserRepository } from "../ports/user-repository.js";

export class GetUsersForAdmin {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: ActorContext): Promise<readonly AdminUserSummaryDto[]> {
    if (actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("manage user roles", actor.role);
    }

    return this.users.findAllForAdmin();
  }
}
