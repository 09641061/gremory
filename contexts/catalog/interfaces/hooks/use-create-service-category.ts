"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createServiceCategoryAction,
  type CategoryActionResult,
} from "../actions/manage-service-category.actions";

export function useCreateServiceCategory(onSuccess?: () => void) {
  const router = useRouter();
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const [state, formAction, pending] = useActionState(
    createServiceCategoryAction,
    { status: "idle", error: null } satisfies CategoryActionResult
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onSuccessRef.current?.();
    }
  }, [state.status, router]);

  return {
    state,
    formAction,
    pending,
  };
}
