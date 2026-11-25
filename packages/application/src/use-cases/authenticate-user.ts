import type { UserDto } from "../dto.js";
import { toUserDto } from "../dto.js";
import { InvalidCredentialsError } from "../errors/application-error.js";
import type { PasswordHasher } from "../ports/password-hasher.js";
import type { UserRepository } from "../ports/user-repository.js";
import { normalizeEmail } from "./application-validation.js";

export interface AuthenticateUserInput {
  readonly email: string;
  readonly password: string;
}

export class AuthenticateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<UserDto> {
    const email = normalizeEmail(input.email);
    if (typeof input.password !== "string" || input.password.length === 0) {
      throw new InvalidCredentialsError();
    }

    const user = await this.users.findByEmail(email);
    if (
      user === null ||
      user.passwordHash === null ||
      !(await this.passwordHasher.verify(input.password, user.passwordHash))
    ) {
      throw new InvalidCredentialsError();
    }

    return toUserDto(user);
  }
}
