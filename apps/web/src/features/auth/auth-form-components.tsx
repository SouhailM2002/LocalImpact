import type { ReactNode } from "react";

export function AuthMessage({
  message,
  role = "alert",
}: {
  readonly message: string;
  readonly role?: "alert" | "status";
}) {
  if (message === "") {
    return null;
  }

  const isStatus = role === "status";
  return (
    <div
      aria-live={isStatus ? "polite" : "assertive"}
      className={[
        "mb-5 rounded-xl border px-4 py-3 text-sm",
        isStatus
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800",
      ].join(" ")}
      role={role}
    >
      {message}
    </div>
  );
}

export function AuthField({
  id,
  label,
  error,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly children: ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-rose-700" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
