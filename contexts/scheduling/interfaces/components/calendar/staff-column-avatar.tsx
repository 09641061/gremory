import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import { SchedulingMemberViewModel } from "../../../application/model/scheduling-page-data.view-model";

interface StaffColumnAvatarProps {
  employee: SchedulingMemberViewModel;
}

export function StaffColumnAvatar({ employee }: StaffColumnAvatarProps) {
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1">
      <Avatar className="h-9 w-9 border shadow-sm">
        {employee.imageUrl && <AvatarImage src={employee.imageUrl} alt={employee.name} />}
        <AvatarFallback className="text-xs font-medium bg-primary/5 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center min-w-0 w-full overflow-hidden">
        <span className="text-sm font-semibold truncate w-full text-center">
          {employee.name}
        </span>
      </div>
    </div>
  );
}
