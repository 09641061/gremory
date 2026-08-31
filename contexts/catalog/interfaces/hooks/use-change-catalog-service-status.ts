"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeCatalogServiceStatusAction,
  type CatalogServiceActionResult,
} from "../actions/manage-catalog-service.actions";

export function useChangeCatalogServiceStatus(onSuccess?: () => void) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CatalogServiceActionResult>({
    status: "idle",
    error: null,
  });

  const changeStatus = (id: string, active: boolean) => {
    startTransition(async () => {
      const result = await changeCatalogServiceStatusAction(id, active);
      setState(result);

      if (result.status === "success") {
        router.refresh();
        onSuccess?.();
      }
    });
  };

  return {
    changeStatus,
    pending: isPending,
    state,
  };
}
