import type { ReactNode } from "react";

import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";

export default function AccessDeniedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
