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
import { InfoBadge } from "@/contexts/shared/interfaces/components/ui/info-badge";
import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { RoleRow } from "./role-row";
import { PermissionsWorkspace } from "./permissions-workspace";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import type { WorkspaceAuthorization } from "@/contexts/business/application/model/business-workspace.view-models";
import type { WorkspaceSubscription } from "@/contexts/business/application/model/business-workspace.view-models";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

export function PermissionsPageView({
  roles,
  permissions,
  members,
  authorization,
  canCreateRole = true,
  canUpdateRole = true,
  canDeleteRole = true,
  subscription,
}: {
  roles: ReadonlyArray<WorkforceRoleSummary>;
  permissions: ReadonlyArray<string>;
  members: ReadonlyArray<TeamUserSummary>;
  authorization?: WorkspaceAuthorization;
  canCreateRole?: boolean;
  canUpdateRole?: boolean;
  canDeleteRole?: boolean;
  subscription?: WorkspaceSubscription;
}) {
  const { t } = useWorkforceTranslations();
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
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return left.name.localeCompare(right.name);
    });
  }, [createdRoles, roles]);

  const memberCountByRoleId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of members) {
      for (const role of member.roles) {
        counts.set(role.id, (counts.get(role.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [members]);

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

  const resolveDropPosition = (event: React.DragEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? "before" as const : "after" as const;
  };

  const handleReorderRole = async (targetRole: WorkforceRoleSummary, placement: "before" | "after") => {
    if (!draggedRoleId || !targetRole.id) return;
    if (draggedRoleId === targetRole.id) return;

    const draggedRole = visibleRoles.find((role) => role.id === draggedRoleId);
    if (!draggedRole || !draggedRole.id) return;

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
            <h1 className="page-title">{t.permissions.title}</h1>
            <p className="page-description mt-2">
              {t.permissions.description}
            </p>
            {authorization ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <InfoBadge>
                  {formatAuthorizationRole(authorization.role)}
                </InfoBadge>
                {authorization.scope ? (
                  <>
                    <InfoBadge>
                      {formatAuthorizationScope(authorization.scope.type)} {t.permissions.scope}
                    </InfoBadge>
                    <InfoBadge>{authorization.scope.name}</InfoBadge>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
          <label className="relative block w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={t.permissions.searchPlaceholder}
              aria-label={t.permissions.searchLabel}
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
              {t.permissions.createRole}
            </Button>
          )}
        </div>

        <ErrorAlert title={t.permissions.unableToReorder} message={reorderError ?? undefined} />

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
              name: createdRole.name ?? t.permissions.newRoleDefaultName,
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
            memberCount={memberCountByRoleId.get(deletingRole.id) ?? 0}
            open={!!deletingRole}
            onOpenChange={(open) => {
              if (!open) setDeletingRole(null);
            }}
          />
        ) : null}

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
              <span>{t.permissions.rolesCount.replace("{count}", String(visibleRoles.length))}</span>
              <span className="pr-1">{t.permissions.actions}</span>
            </div>

            <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
              {filteredRoles.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground">
                  {t.permissions.noRolesFound}
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <RoleRow
                    key={role.id ?? role.name}
                    role={role}
                    memberCount={memberCountByRoleId.get(role.id ?? "") ?? 0}
                    selected={role.id === selectedRoleId}
                    isDragging={draggedRoleId === role.id}
                    dropPosition={dropTargetRoleId === role.id ? dropPosition : null}
                    onSelect={() => role.id && setSelectedRoleId(role.id)}
                    onEdit={(selectedRole) => setEditingRole(selectedRole)}
                    onDelete={(selectedRole) => setDeletingRole(selectedRole)}
                    onDragStart={(draggedRole) => {
                      if (reorderInProgress || !draggedRole.id || !canUpdateRole) return;
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
                      setDropPosition(resolveDropPosition(event));
                    }}
                    onDrop={(event, targetRole) => {
                      event.preventDefault();
                      if (reorderInProgress || !canUpdateRole) return;
                      const placement = resolveDropPosition(event);
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
        subscription={subscription}
      />

    </section>
  );
}

function formatAuthorizationRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatAuthorizationScope(scopeType: string) {
  return scopeType.charAt(0) + scopeType.slice(1).toLowerCase();
}
