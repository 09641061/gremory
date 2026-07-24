"use client";

import { useActionState, useEffect } from "react";
import {
  updateServiceCategoryAction,
  type CategoryActionResult,
} from "../../interfaces/actions/manage-service-category.actions";

export function useUpdateServiceCategory(onSuccess?: () => void) {
  const [state, formAction, pending] = useActionState(
    updateServiceCategoryAction,
    { status: "idle", error: null } satisfies CategoryActionResult
  );

  useEffect(() => {
    if (state.status === "success" && onSuccess) {
      onSuccess();
    }
  }, [state.status, onSuccess]);

  return {
    state,
    formAction,
    pending,
  };
}
