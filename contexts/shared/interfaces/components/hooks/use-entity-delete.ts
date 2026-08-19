"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";

type DeleteAction = (
  previous: BusinessActionResult,
  formData: FormData,
) => Promise<BusinessActionResult>;

/**
 * Encapsulates the target-id + confirm-dialog + Server Action mechanics every
 * per-row delete flow already repeated (establishments, members, …): tracks
 * which row is being deleted, drives the action, and refreshes the router
 * once it succeeds, then clears the target so the dialog closes.
 */
export function useEntityDelete(action: DeleteAction) {
  const router = useRouter();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [state, dispatch, pending] = useActionState(action, initialBusinessActionResult);

  // Clears the target the moment the action reports success, computed during
  // render (not an effect) so the dialog closes in the same commit instead of
  // a follow-up render.
  const [prevStatus, setPrevStatus] = useState(state.status);
  if (state.status !== prevStatus) {
    setPrevStatus(state.status);
    if (state.status === "success" && targetId !== null) {
      setTargetId(null);
    }
  }

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const requestDelete = (id: string) => setTargetId(id);

  const open = targetId !== null && state.status !== "success";

  return {
    targetId,
    requestDelete,
    pending,
    error: state.status === "error" ? state.error : undefined,
    dialogProps: {
      open,
      onOpenChange: (nextOpen: boolean) => {
        if (!nextOpen) setTargetId(null);
      },
      pending,
      error: state.status === "error" ? state.error : undefined,
      formAction: dispatch,
    },
  };
}
