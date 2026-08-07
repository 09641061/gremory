import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function FreeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      {...props}
    >
      <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="8" />
      <path
        d="M56.5 30.5c-1.2-3.5-4.4-5.9-8.3-5.9-5.2 0-9.4 4.2-9.4 9.4 0 5.1 3.8 7.6 8.3 9.1l3.9 1.3c5.1 1.7 9 4.9 9 11 0 6.8-5.5 12.3-12.3 12.3-5.4 0-10-3.4-11.6-8.3"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M48 23v50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
