"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createCatalogServiceAction,
  type CreateCatalogServiceActionState,
} from "../actions/create-catalog-service.action";

export function useCreateCatalogService(onSuccess?: () => void) {
  const router = useRouter();
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const [state, formAction, pending] = useActionState(
    createCatalogServiceAction,
    { status: "idle", data: null, error: null } satisfies CreateCatalogServiceActionState
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
