import type { ComponentProps } from "react";

import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { cn } from "@/lib/utils";

type InfoBadgeProps = ComponentProps<typeof Badge>;

export function InfoBadge({ className, variant = "outline", ...props }: InfoBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn("h-6 rounded-full border-border bg-card px-2.5 text-[11px] font-medium text-foreground", className)}
      {...props}
    />
  );
}
