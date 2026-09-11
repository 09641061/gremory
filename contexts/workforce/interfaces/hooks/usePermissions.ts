"use client";

import { useCallback } from "react";

import { useWorkspaceAuth } from "@/contexts/workforce/interfaces/context/WorkspaceAuthContext";

export function usePermissions() {
  const authorization = useWorkspaceAuth();

  const hasPermission = useCallback(
    (permission: string): boolean => {
      const effectivePermissions = authorization?.effectivePermissions ?? [];
      return effectivePermissions.includes("*") || effectivePermissions.includes(permission);
    },
    [authorization],
  );

  const isSystemRole = useCallback(
    (roleName: string): boolean =>
      authorization?.roles.some((role) => role.name === roleName && role.systemRole) ?? false,
    [authorization],
  );

  return { hasPermission, isSystemRole };
}
