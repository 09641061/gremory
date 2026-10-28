"use client";

import Link from "next/link";
import { Archive, Pencil } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/dialogs/delete-confirm-dialog";
import { archiveWorkforceRoleAction } from "../actions/workforce.actions";

export function RoleRowActions({ organizationId, role }: {
  organizationId: string;
  role: { id: string; name: string; version: number; activeMemberCount: number; pendingInvitationCount: number; status: "ACTIVE" | "ARCHIVED" };
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inUse = role.activeMemberCount + role.pendingInvitationCount > 0;
  const archive = () => startTransition(async () => {
    const result = await archiveWorkforceRoleAction(organizationId, role.id, role.version);
    if (result.success) setOpen(false); else setError(result.error);
  });

  return <div className="flex justify-end gap-2">
    <Button variant="ghost" size="sm" render={<Link href={`/organization/roles/${role.id}`} />}><Pencil data-icon="inline-start" />Editar</Button>
    {role.status === "ACTIVE" && <Button variant="ghost" size="sm" disabled={inUse} onClick={() => setOpen(true)} title={inUse ? "Quita el rol de miembros e invitaciones antes de archivarlo" : undefined}><Archive data-icon="inline-start" />Archivar</Button>}
    <DeleteConfirmDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(null); }} entityLabel="rol" entityName={role.name} pending={pending} error={error} confirmLabel="Archivar" pendingLabel="Archivando…" description="El rol dejará de estar disponible para nuevas asignaciones. Su historial se conservará." onConfirm={archive} />
  </div>;
}
