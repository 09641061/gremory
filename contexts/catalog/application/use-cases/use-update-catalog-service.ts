"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateCatalogServiceAction,
  type CatalogServiceActionResult,
} from "../../interfaces/actions/manage-catalog-service.actions";

export function useUpdateCatalogService(onSuccess?: () => void) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateCatalogServiceAction,
    { status: "idle", error: null } satisfies CatalogServiceActionResult
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
