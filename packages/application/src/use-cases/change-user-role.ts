import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import type { ActorContext, UserDto, UserRole } from "../dto.js";
import { toUserDto } from "../dto.js";
import {
  ApplicationValidationError,
  LastAdministratorRoleChangeError,
  SelfRoleChangeError,
  UserNotFoundError,
} from "../errors/application-error.js";
import type { UserRepository } from "../ports/user-repository.js";
import { requireNonBlank } from "./application-validation.js";

function isUserRole(role: string): role is UserRole {
  return role === "USER" || role === "RESPONSABLE" || role === "ADMIN";
}

export interface ChangeUserRoleInput {
  readonly actor: ActorContext;
  readonly targetUserId: string;
  readonly newRole: string;
}

export class ChangeUserRole {
  constructor(private readonly users: UserRepository) {}

  async execute(input: ChangeUserRoleInput): Promise<UserDto> {
    if (input.actor.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("change a user's role", input.actor.role);
    }

    const targetUserId = requireNonBlank(input.targetUserId, "targetUserId");
    if (targetUserId === input.actor.userId) {
      throw new SelfRoleChangeError();
    }
    if (!isUserRole(input.newRole)) {
      throw new ApplicationValidationError("newRole", "A valid user role is required.");
    }

    const result = await this.users.changeRole(targetUserId, input.newRole);
    if (result.kind === "not_found") {
      throw new UserNotFoundError(targetUserId);
    }
    if (result.kind === "last_admin") {
      throw new LastAdministratorRoleChangeError();
    }

    return toUserDto(result.user);
  }
}
