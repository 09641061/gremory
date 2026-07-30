"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateCatalogServiceAction,
  type CatalogServiceActionResult,
} from "../actions/manage-catalog-service.actions";

export function useUpdateCatalogService(onSuccess?: () => void) {
  const router = useRouter();
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const [state, formAction, pending] = useActionState(
    updateCatalogServiceAction,
    { status: "idle", error: null } satisfies CatalogServiceActionResult
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
