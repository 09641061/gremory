import type { ReactNode } from "react";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return <main className="flex-1 p-6 pt-20">{children}</main>;
}
