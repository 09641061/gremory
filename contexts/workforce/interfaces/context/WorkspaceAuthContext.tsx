"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { AuthorizationResource } from "@/contexts/workforce/application/model/user-session";

export const WorkspaceAuthContext = createContext<AuthorizationResource | null>(null);

export function WorkspaceAuthProvider({
  authorization,
  children,
}: {
  authorization: AuthorizationResource | null | undefined;
  children: ReactNode;
}) {
  const value = useMemo(() => authorization ?? null, [authorization]);

  return <WorkspaceAuthContext.Provider value={value}>{children}</WorkspaceAuthContext.Provider>;
}

export function useWorkspaceAuth(): AuthorizationResource | null {
  return useContext(WorkspaceAuthContext);
}
