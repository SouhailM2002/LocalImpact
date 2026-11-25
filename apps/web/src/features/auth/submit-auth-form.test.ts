import { describe, expect, it, vi } from "vitest";

import {
  submitLoginForm,
  submitRegistrationForm,
  type LoginCredentials,
  type RegistrationCredentials,
} from "./auth-validation";

function makeFormData(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("authentication form submission", () => {
  it("normalizes the login email and rejects invalid credentials before calling auth", async () => {
    const authenticate = vi.fn<(credentials: LoginCredentials) => Promise<void>>()
      .mockResolvedValue(undefined);
    const valid = await submitLoginForm(
      makeFormData({ email: "  USER@Example.Test ", password: "password123" }),
      authenticate,
    );

    expect(valid).toEqual({ ok: true });
    expect(authenticate).toHaveBeenCalledWith({
      email: "user@example.test",
      password: "password123",
    });

    const invalid = await submitLoginForm(
      makeFormData({ email: "not-an-email", password: "short" }),
      authenticate,
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.state.fieldErrors.email).toBeDefined();
      expect(invalid.state.fieldErrors.password).toBeDefined();
    }
    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  it("requires matching passwords and never forwards a client-supplied role", async () => {
    const createAccount = vi.fn<
      (credentials: RegistrationCredentials) => Promise<void>
    >().mockResolvedValue(undefined);
    const base = {
      name: "Camille Martin",
      email: "CAMILLE@example.test",
      password: "secure-password",
      confirmPassword: "different-password",
      role: "ADMIN",
    };

    const invalid = await submitRegistrationForm(
      makeFormData(base),
      createAccount,
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.state.fieldErrors.confirmPassword).toBeDefined();
    }
    expect(createAccount).not.toHaveBeenCalled();

    const valid = await submitRegistrationForm(
      makeFormData({ ...base, confirmPassword: base.password }),
      createAccount,
    );
    expect(valid).toEqual({ ok: true });
    expect(createAccount).toHaveBeenCalledWith({
      name: "Camille Martin",
      email: "camille@example.test",
      password: "secure-password",
    });
    expect(createAccount.mock.calls[0]?.[0]).not.toHaveProperty("role");
  });
});
