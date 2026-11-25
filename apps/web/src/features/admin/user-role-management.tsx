"use client";

import { useState } from "react";
import type { AdminUserSummaryDto } from "@localimpact/application";
import { Badge, Button, Card } from "@localimpact/ui";

import { ChangeUserRoleForm } from "./change-user-role-form";

const pageSize = 10;

export function UserRoleManagement({
  users,
  currentAdminId,
}: {
  readonly users: readonly AdminUserSummaryDto[];
  readonly currentAdminId: string;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstUserIndex = (currentPage - 1) * pageSize;
  const visibleUsers = users.slice(firstUserIndex, firstUserIndex + pageSize);

  return (
    <section aria-labelledby="user-roles-title" className="space-y-3">
      <div>
        <Badge className="mb-2" variant="info">Accès</Badge>
        <h2 className="text-2xl font-black text-slate-950" id="user-roles-title">
          Gestion des rôles
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Attribuez à chaque compte les permissions de membre, responsable ou administrateur.
          Le dernier administrateur ne peut pas être rétrogradé.
        </p>
      </div>

      <Card className="overflow-hidden border-2 border-slate-900">
        {users.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">Aucun compte à afficher.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3" scope="col">Compte</th>
                  <th className="px-4 py-3" scope="col">Rôle actuel</th>
                  <th className="px-4 py-3" scope="col">Modifier le rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-slate-950">
                        {user.displayName}
                        {user.id === currentAdminId && (
                          <span className="ml-2 text-xs font-medium text-slate-500">(vous)</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>
                        {user.role === "ADMIN"
                          ? "Administrateur"
                          : user.role === "RESPONSABLE" ? "Responsable" : "Membre"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {user.id === currentAdminId ? (
                        <p className="text-sm leading-6 text-slate-600">
                          Votre propre rôle ne peut pas être modifié.
                        </p>
                      ) : (
                        <ChangeUserRoleForm
                          currentRole={user.role}
                          userId={user.id}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {users.length > 0 && (
          <nav
            aria-label="Pagination des comptes"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3"
          >
            <p aria-live="polite" className="text-sm text-slate-600">
              Comptes {firstUserIndex + 1}–{Math.min(firstUserIndex + pageSize, users.length)}
              {" "}sur {users.length} · Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                size="sm"
                variant="secondary"
              >
                Précédent
              </Button>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                size="sm"
                variant="secondary"
              >
                Suivant
              </Button>
            </div>
          </nav>
        )}
      </Card>
    </section>
  );
}
