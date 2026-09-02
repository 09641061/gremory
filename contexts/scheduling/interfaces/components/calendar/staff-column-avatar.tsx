import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import { SchedulingMemberViewModel } from "../../../application/model/scheduling-page-data.view-model";

interface StaffColumnAvatarProps {
  employee: SchedulingMemberViewModel;
}

export function StaffColumnAvatar({ employee }: StaffColumnAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1">
      <Avatar className="h-9 w-9 border shadow-sm">
        <AvatarImage src={employee.imageUrl ?? undefined} alt={employee.name} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          <User className="size-4" aria-hidden="true" />
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
