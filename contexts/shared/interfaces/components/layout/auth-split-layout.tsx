import type { ReactNode } from "react";

/**
 * Two column shell shared by the authentication screens: the brand panel on
 * the left and the form on the right. On small screens the brand panel is
 * hidden and the form takes the whole viewport.
 */
export function AuthSplitLayout({
  aside,
  children,
}: {
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full">
      {aside}
      <div className="flex min-h-svh flex-1 items-center justify-center bg-background px-6 py-14 sm:px-10">
        {children}
      </div>
    </div>
  );
}
