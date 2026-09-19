"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isRoleColor } from "./role-color";
import type { WorkforceRoleResource } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

type RoleColorOverrides = Readonly<Record<string, string>>;

type RoleIdentity = Pick<WorkforceRoleResource, "id" | "color">;

interface WorkforceRoleColorContextValue {
  /**
   * Overrides captured from role reads and successful mutations. Keeping them
   * here (instead of on each roster row) lets a saved hex color reach every
   * badge without refetching the members list.
   */
  roleColors: RoleColorOverrides;
  /** Merges the authoritative colors returned by the roles endpoint. */
  syncRoleColors: (roles: ReadonlyArray<RoleIdentity>) => void;
  /** Optimistically records a single role's saved color. */
  setRoleColor: (roleId: string, color: string | null | undefined) => void;
  /** Resolves the effective color for a role, preferring the shared override. */
  resolveRoleColor: (role: RoleIdentity | null | undefined) => string | undefined;
}

const WorkforceRoleColorContext = createContext<WorkforceRoleColorContextValue | null>(null);

/**
 * Shared roles dictionary for the organization settings surface. The roles editor
 * publishes saved colors here through {@link setRoleColor}, and the members and
 * invitations tables resolve their badge colors from it, so both stay in sync
 * without a page reload or a redundant roster fetch.
 */
export function WorkforceRoleColorProvider({ children }: { children: ReactNode }) {
  const [roleColors, setRoleColors] = useState<RoleColorOverrides>({});

  const syncRoleColors = useCallback((roles: ReadonlyArray<RoleIdentity>) => {
    setRoleColors((current) => {
      let changed = false;
      const next: Record<string, string> = { ...current };
      for (const role of roles) {
        if (!role?.id || !isRoleColor(role.color)) continue;
        if (next[role.id] !== role.color) {
          next[role.id] = role.color;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const setRoleColor = useCallback((roleId: string, color: string | null | undefined) => {
    if (!roleId) return;
    setRoleColors((current) => {
      if (isRoleColor(color)) {
        return current[roleId] === color ? current : { ...current, [roleId]: color };
      }
      if (!(roleId in current)) return current;
      const next: Record<string, string> = { ...current };
      delete next[roleId];
      return next;
    });
  }, []);

  const resolveRoleColor = useCallback(
    (role: RoleIdentity | null | undefined) => {
      if (!role) return undefined;
      const override = roleColors[role.id];
      if (isRoleColor(override)) return override;
      return isRoleColor(role.color) ? role.color : undefined;
    },
    [roleColors],
  );

  const value = useMemo<WorkforceRoleColorContextValue>(
    () => ({ roleColors, syncRoleColors, setRoleColor, resolveRoleColor }),
    [roleColors, syncRoleColors, setRoleColor, resolveRoleColor],
  );

  return (
    <WorkforceRoleColorContext.Provider value={value}>
      {children}
    </WorkforceRoleColorContext.Provider>
  );
}

const noop = () => undefined;

const FALLBACK_ROLE_COLOR_CONTEXT: WorkforceRoleColorContextValue = {
  roleColors: {},
  syncRoleColors: noop,
  setRoleColor: noop,
  resolveRoleColor: (role) => (isRoleColor(role?.color) ? role.color : undefined),
};

/**
 * Degrades gracefully outside the provider (for example the `/permissions` editor,
 * which renders role controls without the organization roster) instead of throwing.
 */
export function useWorkforceRoleColors(): WorkforceRoleColorContextValue {
  return useContext(WorkforceRoleColorContext) ?? FALLBACK_ROLE_COLOR_CONTEXT;
}
