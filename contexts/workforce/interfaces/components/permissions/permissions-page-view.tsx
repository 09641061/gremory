"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { RoleRow } from "./role-row";
import { PermissionsWorkspace } from "./permissions-workspace";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";

export function PermissionsPageView({
  roles,
  permissions,
  members,
  canCreateRole = true,
  canUpdateRole = true,
  canDeleteRole = true,
}: {
  roles: ReadonlyArray<WorkforceRoleSummary>;
  permissions: ReadonlyArray<string>;
  members: ReadonlyArray<TeamUserSummary>;
  canCreateRole?: boolean;
  canUpdateRole?: boolean;
  canDeleteRole?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createSession, setCreateSession] = useState(0);
  const [createdRoles, setCreatedRoles] = useState<ReadonlyArray<WorkforceRoleSummary>>([]);
  const [editingRole, setEditingRole] = useState<WorkforceRoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<WorkforceRoleSummary | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draggedRoleId, setDraggedRoleId] = useState<string | null>(null);
  const [dropTargetRoleId, setDropTargetRoleId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reorderInProgress, setReorderInProgress] = useState(false);
  const router = useRouter();

  const visibleRoles = useMemo(() => {
    const existingIds = new Set(roles.map((role) => role.id).filter((id): id is string => id !== null));
    const merged = [...roles, ...createdRoles.filter((role) => !role.id || !existingIds.has(role.id))];

    return merged.sort((left, right) => {
      if (left.systemRole !== right.systemRole) {
        return left.systemRole ? 1 : -1;
      }

      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return left.name.localeCompare(right.name);
    });
  }, [createdRoles, roles]);

  const filteredRoles = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) return visibleRoles;
    return visibleRoles.filter((role) => role.name.toLowerCase().includes(normalizedFilter));
  }, [filter, visibleRoles]);

  const selectedRole = visibleRoles.find((role) => role.id === selectedRoleId) ?? null;

  const clearDragState = () => {
    setDraggedRoleId(null);
    setDropTargetRoleId(null);
    setDropPosition(null);
  };

  const resolveDropPosition = (event: React.DragEvent<HTMLDivElement>, role: WorkforceRoleSummary) => {
    if (role.systemRole) return "before" as const;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? "before" as const : "after" as const;
  };

  const handleReorderRole = async (targetRole: WorkforceRoleSummary, placement: "before" | "after") => {
    if (!draggedRoleId || !targetRole.id) return;
    if (draggedRoleId === targetRole.id) return;

    const draggedRole = visibleRoles.find((role) => role.id === draggedRoleId);
    if (!draggedRole || draggedRole.systemRole || !draggedRole.id) return;

    const newPosition = placement === "after" ? targetRole.position + 1 : targetRole.position;
    if (draggedRole.position === newPosition) return;

    setReorderInProgress(true);
    setReorderError(null);

    const formData = new FormData();
    formData.append("roleId", draggedRole.id ?? "");
    formData.append("position", String(newPosition));

    const result = await patchWorkforceRoleAction({ status: "idle", data: null, error: null }, formData);
    setReorderInProgress(false);
    clearDragState();

    if (result.status === "success") {
      router.refresh();
      return;
    }

    setReorderError(result.error);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      <div className="w-full space-y-6 lg:flex-1 lg:flex lg:flex-col lg:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Permissions</h1>
            <p className="page-description mt-2">
              Search, create, and manage the team roles available in your account.
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
          <label className="relative block w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search roles"
              aria-label="Search roles"
              className="pl-9"
            />
          </label>
          {canCreateRole && (
            <Button
              type="button"
              size="default"
              onClick={() => setCreateOpen(true)}
              className="shrink-0 gap-2 sm:whitespace-nowrap"
            >
              <Plus className="size-4" />
              Create role
            </Button>
          )}
        </div>

        <ErrorAlert title="Unable to reorder role" message={reorderError ?? undefined} />

        <CreateRoleDialog
          key={createSession}
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setCreateSession((session) => session + 1);
          }}
          onCreated={(createdRole) => {
            if (!createdRole?.roleId) return;
            const nextRole: WorkforceRoleSummary = {
              id: createdRole.roleId ?? null,
              name: createdRole.name ?? "New role",
              permissions: [],
              systemRole: false,
              position: createdRole.position ?? 1,
            };
            setCreatedRoles((current) => [...current.filter((role) => role.id !== nextRole.id), nextRole]);
            setSelectedRoleId(createdRole.roleId);
          }}
        />

        {editingRole ? (
          <EditRoleDialog
            key={editingRole.id}
            role={editingRole}
            open={!!editingRole}
            onOpenChange={(open) => {
              if (!open) setEditingRole(null);
            }}
          />
        ) : null}

        {deletingRole && deletingRole.id ? (
          <DeleteRoleDialog
            key={deletingRole.id}
            roleId={deletingRole.id}
            roleName={deletingRole.name}
            isSystemRole={deletingRole.systemRole}
            open={!!deletingRole}
            onOpenChange={(open) => {
              if (!open) setDeletingRole(null);
            }}
          />
        ) : null}

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
              <span>Roles - {visibleRoles.length}</span>
              <span className="pr-1">Actions</span>
            </div>

            <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {filteredRoles.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground">
                  No roles found.
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <RoleRow
                    key={role.id ?? role.name}
                    role={role}
                    selected={role.id === selectedRoleId}
                    isDragging={draggedRoleId === role.id}
                    dropPosition={dropTargetRoleId === role.id ? dropPosition : null}
                    onSelect={() => role.id && setSelectedRoleId(role.id)}
                    onEdit={(selectedRole) => setEditingRole(selectedRole)}
                    onDelete={(selectedRole) => setDeletingRole(selectedRole)}
                    onDragStart={(draggedRole) => {
                      if (draggedRole.systemRole || reorderInProgress || !draggedRole.id || !canUpdateRole) return;
                      setReorderError(null);
                      setDraggedRoleId(draggedRole.id);
                    }}
                    onDragEnd={clearDragState}
                    onDragOver={(event, hoveredRole) => {
                      if (reorderInProgress || !canUpdateRole) return;
                      if (!draggedRoleId || draggedRoleId === hoveredRole.id) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTargetRoleId(hoveredRole.id);
                      setDropPosition(resolveDropPosition(event, hoveredRole));
                    }}
                    onDrop={(event, targetRole) => {
                      event.preventDefault();
                      if (reorderInProgress || !canUpdateRole) return;
                      const placement = resolveDropPosition(event, targetRole);
                      void handleReorderRole(targetRole, placement);
                    }}
                    canUpdateRole={canUpdateRole}
                    canDeleteRole={canDeleteRole}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PermissionsWorkspace
        key={selectedRole?.id ?? "empty"}
        role={selectedRole}
        permissions={permissions}
        onCancel={() => setSelectedRoleId(null)}
        members={members}
        canUpdateRole={canUpdateRole}
      />

    </section>
  );
}
