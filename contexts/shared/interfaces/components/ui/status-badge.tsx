import type { ComponentProps } from "react";

import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { cn } from "@/lib/utils";

const statusBadgeVariants = {
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  neutral: "border-border bg-card text-foreground",
} as const;

type StatusBadgeVariant = keyof typeof statusBadgeVariants;

type StatusBadgeProps = ComponentProps<typeof Badge> & {
  tone?: StatusBadgeVariant;
};

export function StatusBadge({
  tone = "neutral",
  className,
  variant = "outline",
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "h-6 rounded-full px-2 text-[11px] font-medium",
        statusBadgeVariants[tone],
        className,
      )}
      {...props}
    />
  );
}
