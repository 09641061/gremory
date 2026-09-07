import type { ReactNode } from "react";

import ProtectedAppShell from "@/contexts/shared/interfaces/components/protected-app-shell";

/** Terminal states keep the account sidebar available without opening a module. */
export default function StatusLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
