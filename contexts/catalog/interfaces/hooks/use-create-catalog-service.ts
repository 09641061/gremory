"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCatalogServiceAction,
  type CreateCatalogServiceActionState,
} from "../actions/create-catalog-service.action";
import type { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";

export function useCreateCatalogService(onSuccess?: (service: DetailedServiceDTO) => void) {
  const onSuccessRef = useRef(onSuccess);

  const [state, formAction, pending] = useActionState(
    createCatalogServiceAction,
    { status: "idle", data: null, error: null } satisfies CreateCatalogServiceActionState
  );

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (state.status === "success") {
      const service = state.data;
      if (service) {
        onSuccessRef.current?.(service);
      }
    }
  }, [state.data, state.status]);

  return {
    state,
    formAction,
    pending,
  };
}
