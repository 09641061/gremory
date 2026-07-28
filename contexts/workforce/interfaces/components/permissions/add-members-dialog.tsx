"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, User } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import type { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";
import { assignWorkforceRoleAction } from "@/contexts/workforce/interfaces/actions/workforce-role.actions";

interface AddMembersDialogProps {
  roleId: string;
  availableMembers: TeamUserSummary[];
  onClose: () => void;
}

export function AddMembersDialog({ roleId, availableMembers, onClose }: AddMembersDialogProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredMembers = availableMembers.filter((member) =>
    member.email.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  const handleToggleSelect = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        for (const memberId of selectedIds) {
          const formData = new FormData();
          formData.append("roleId", roleId);
          formData.append("memberId", memberId);
          const result = await assignWorkforceRoleAction({ status: "idle", data: null, error: null }, formData);
          if (result.status === "error") {
            throw new Error(result.error ?? "Failed to add one or more members");
          }
        }
        router.refresh();
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to add members");
      }

    });
  };

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent
        ref={contentRef}
        className="w-full max-w-[480px] p-6 bg-card border border-border rounded-xl shadow-xl flex flex-col gap-5"
      >
        <AlertDialogHeader className="relative">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-xl font-semibold text-foreground">Add members to role</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
            Select members from the workspace to assign them to this role.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search members"
              className="pl-9 h-10 bg-muted/40 border border-border"
              disabled={isPending}
            />
          </label>

          {error && <ErrorAlert title="Unable to add members" message={error} />}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Members
            </span>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border bg-muted/10">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No members available to add.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const mId = member.memberId ?? "";
                  const isSelected = selectedIds.includes(mId);

                  return (
                    <div
                      key={mId}
                      onClick={() => !isPending && handleToggleSelect(mId)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-muted/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`size-5 rounded flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-muted-foreground/50"
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3px]" />}
                      </div>

                      {/* Avatar Icon */}
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                        <User className="size-4" />
                      </div>

                      {/* Full Email */}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground truncate block">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex items-center justify-end gap-3 mt-2 shrink-0">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isPending}
            className="px-5 h-10 border border-border bg-transparent hover:bg-muted/40 text-foreground transition-colors"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || isPending}
            className="px-5 h-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors min-w-[80px]"
          >
            {isPending ? <Spinner className="size-4" /> : "Add"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
