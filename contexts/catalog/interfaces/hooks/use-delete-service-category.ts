"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteServiceCategoryAction,
  type CategoryActionResult,
} from "../actions/manage-service-category.actions";

export function useDeleteServiceCategory(onSuccess?: () => void) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CategoryActionResult>({
    status: "idle",
    error: null,
  });

  const deleteCategory = (id: string, establishmentId?: string) => {
    startTransition(async () => {
      const result = await deleteServiceCategoryAction(id, establishmentId);
      setState(result);

      if (result.status === "success") {
        router.refresh();
        onSuccess?.();
      }
    });
  };

  return {
    deleteCategory,
    pending: isPending,
    state,
  };
}
