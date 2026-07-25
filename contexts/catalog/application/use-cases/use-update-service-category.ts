"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateServiceCategoryAction,
  type CategoryActionResult,
} from "../../interfaces/actions/manage-service-category.actions";

export function useUpdateServiceCategory(onSuccess?: () => void) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateServiceCategoryAction,
    { status: "idle", error: null } satisfies CategoryActionResult
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state.status, onSuccess, router]);

  return {
    state,
    formAction,
    pending,
  };
}
