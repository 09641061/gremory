import { SchedulingMemberViewModel } from "../../../application/model/scheduling-page-data.view-model";
import { StaffColumnAvatar } from "./staff-column-avatar";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffColumnsHeaderProps {
  employees: SchedulingMemberViewModel[];
  visibleEmployees: SchedulingMemberViewModel[];
  startIndex: number;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  maxColumns: number;
}

export function StaffColumnsHeader({
  employees,
  visibleEmployees,
  startIndex,
  onShiftLeft,
  onShiftRight,
  maxColumns,
}: StaffColumnsHeaderProps) {
  const canShiftLeft = startIndex > 0;
  const canShiftRight = startIndex + maxColumns < employees.length;

  const gridColsClass = 
    visibleEmployees.length === 1 
      ? "grid-cols-[350px_1fr]" 
      : visibleEmployees.length === 2 
        ? "grid-cols-[300px_300px_1fr]" 
        : "auto-cols-fr grid-flow-col";

  return (
    <div className={cn("flex w-full border-b bg-muted/30 [scrollbar-gutter:stable]")}>
      <div className="w-16 flex-shrink-0 border-r py-2 pr-2 relative bg-muted/5 flex flex-col justify-end">
        {employees.length > maxColumns && (
          <div className="flex w-full justify-between px-1 pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onShiftLeft}
              aria-label="Previous staff members"
              title="Previous staff members"
              disabled={!canShiftLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onShiftRight}
              aria-label="Next staff members"
              title="Next staff members"
              disabled={!canShiftRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className={cn("flex-1 grid divide-x", gridColsClass)}>
        {visibleEmployees.map((employee) => (
          <div key={employee.userId} className="min-w-0 flex-1">
            <StaffColumnAvatar employee={employee} />
          </div>
        ))}
        {visibleEmployees.length < 3 ? (
          <div className="min-w-0 flex-1" />
        ) : (
          Array.from({ length: Math.max(0, maxColumns - visibleEmployees.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="min-w-0 flex-1" />
          ))
        )}
      </div>
    </div>
  );
}
