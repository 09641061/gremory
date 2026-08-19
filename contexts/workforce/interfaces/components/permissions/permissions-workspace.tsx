"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User } from "lucide-react";
import type { WorkforcePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import { isWorkforceAssignablePermission } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { patchWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";
import { initialWorkforceRoleActionResult } from "@/contexts/workforce/interfaces/actions/workforce-role-action-result";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/contexts/shared/interfaces/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { RolePermissionsTab } from "./role-permissions-tab";
import { RoleMembersTab } from "./role-members-tab";

interface PermissionsWorkspaceProps {
  role: WorkforceRoleSummary | null;
  permissions: ReadonlyArray<WorkforcePermission | string>;
  members: ReadonlyArray<TeamUserSummary>;
  onCancel?: () => void;
  canUpdateRole?: boolean;
}

export function PermissionsWorkspace({
  role,
  permissions,
  members,
  onCancel,
  canUpdateRole = true,
}: PermissionsWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"permissions" | "members">("permissions");
  const [selectedPermissions, setSelectedPermissions] = useState<ReadonlySet<string>>(
    new Set((role?.permissions ?? []).filter((permission) => isWorkforceAssignablePermission(permission))),
  );
  const [permissionFilter, setPermissionFilter] = useState("");
  const [state, formAction, pending] = useActionState(
    patchWorkforceRoleAction,
    initialWorkforceRoleActionResult,
  );

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  if (!role) {
    return (
      <div className="hidden flex-1 lg:block">
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <User className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select a role</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a role to configure its permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  const editable = canUpdateRole;

  function cancelChanges() {
    setSelectedPermissions(
      new Set((role?.permissions ?? []).filter((permission) => isWorkforceAssignablePermission(permission))),
    );
    onCancel?.();
  }

  const content = (
    <CardContent className="flex min-h-0 flex-1 flex-col p-0">
      <input type="hidden" name="roleId" value={role.id ?? ""} />
      <input type="hidden" name="permissionsSubmitted" value="true" />
      {[...selectedPermissions].map((permission) => (
        <input key={permission} type="hidden" name="permissions" value={permission} />
      ))}

      <div className="flex min-h-0 flex-1 flex-col gap-6 px-6 py-5">
        <ErrorAlert
          title="Unable to save permissions"
          message={state.status === "error" ? state.error : undefined}
        />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "permissions" | "members")}
          className="shrink-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="members">Manage members</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "permissions" ? (
          <RolePermissionsTab
            permissions={permissions}
            editable={editable}
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
            permissionFilter={permissionFilter}
            setPermissionFilter={setPermissionFilter}
          />
        ) : (
          <RoleMembersTab role={role} members={members} editable={editable} />
        )}
      </div>

      {activeTab === "permissions" ? (
        <CardFooter className="shrink-0 justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
          <Button type="button" variant="ghost" onClick={cancelChanges} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || !editable} className="gap-2">
            {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      ) : null}
    </CardContent>
  );

  return (
    <div className="hidden flex-1 lg:block">
      <Card className="rounded-xl border-border bg-card shadow-sm lg:ml-3 lg:h-[calc(100vh-10rem)] flex flex-col">
        {activeTab === "permissions" ? (
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            {content}
          </form>
        ) : (
          content
        )}
      </Card>
    </div>
  );
}
