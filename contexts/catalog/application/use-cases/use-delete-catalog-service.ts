"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteCatalogServiceAction,
  type CatalogServiceActionResult,
} from "../../interfaces/actions/manage-catalog-service.actions";

export function useDeleteCatalogService(onSuccess?: () => void) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CatalogServiceActionResult>({
    status: "idle",
    error: null,
  });

  const deleteService = (id: string) => {
    startTransition(async () => {
      const result = await deleteCatalogServiceAction(id);
      setState(result);
      if (result.status === "success") {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  return {
    deleteService,
    pending: isPending,
    state,
  };
}
