"use client";

import { useActionState, useEffect } from "react";
import {
  createServiceCategoryAction,
  type CategoryActionResult,
} from "../../interfaces/actions/manage-service-category.actions";

export function useCreateServiceCategory(onSuccess?: () => void) {
  const [state, formAction, pending] = useActionState(
    createServiceCategoryAction,
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
