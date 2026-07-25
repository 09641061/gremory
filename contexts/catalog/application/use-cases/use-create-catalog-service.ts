"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createCatalogServiceAction,
  type CreateCatalogServiceActionState,
} from "../../interfaces/actions/create-catalog-service.action";

export function useCreateCatalogService(onSuccess?: () => void) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCatalogServiceAction,
    { status: "idle", data: null, error: null } satisfies CreateCatalogServiceActionState
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
