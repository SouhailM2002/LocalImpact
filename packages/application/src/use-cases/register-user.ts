import { UnauthorizedDomainOperationError } from "@localimpact/domain";
import type { ActorContext, UserDto, UserRole } from "../dto.js";
import { toUserDto } from "../dto.js";
import {
  ApplicationValidationError,
  UserAlreadyExistsError,
} from "../errors/application-error.js";
import type { Clock } from "../ports/clock.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { PasswordHasher } from "../ports/password-hasher.js";
import type { UserRepository } from "../ports/user-repository.js";
import { assertSupportedRole, normalizeEmail, requireNonBlank } from "./application-validation.js";

export interface RegisterUserInput {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly requestedRole?: UserRole;
  readonly registeredBy?: ActorContext;
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: RegisterUserInput): Promise<UserDto> {
    const displayName = requireNonBlank(input.displayName, "displayName");
    const email = normalizeEmail(input.email);
    if (typeof input.password !== "string" || input.password.length < 8) {
      throw new ApplicationValidationError("password", "Password must contain at least 8 characters.");
    }

    const role = input.requestedRole ?? "USER";
    assertSupportedRole(role);
    if (role !== "USER" && input.registeredBy?.role !== "ADMIN") {
      throw new UnauthorizedDomainOperationError("register a privileged account", "USER");
    }
    if (await this.users.findByEmail(email) !== null) {
      throw new UserAlreadyExistsError(email);
    }

    const user = await this.users.create({
      id: this.ids.next(),
      displayName,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      role,
      createdAt: this.clock.now(),
    });

    return toUserDto(user);
  }
}
