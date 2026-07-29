"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { GeneralInfoSection } from "../new/general-info-section";
import { FinancialsAndLogisticsSection } from "../new/financials-and-logistics-section";
import { InstructionsSection } from "../new/instructions-section";
import { useUpdateCatalogService } from "../../../application/use-cases/use-update-catalog-service";
import { useDeleteCatalogService } from "../../../application/use-cases/use-delete-catalog-service";
import { useChangeCatalogServiceStatus } from "../../../application/use-cases/use-change-catalog-service-status";
import type { DetailedServiceDTO } from "./service-detail-view";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
}

export function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const { changeStatus, pending: statusPending, state: statusState } = useChangeCatalogServiceStatus();
  const { state: updateState, formAction, pending: updatePending } = useUpdateCatalogService(() => {
    router.push("/catalog");
  });
  const { deleteService, pending: deletePending, state: deleteState } = useDeleteCatalogService(() => {
    router.push("/catalog");
  });

  const isActive = service.status === "ACTIVE";

  // Combined error and loading state for actions
  const errorState = 
    updateState.status === "error" 
      ? updateState 
      : deleteState.status === "error" 
      ? deleteState 
      : statusState.status === "error"
      ? statusState
      : null;

  const isActionPending = updatePending || deletePending;

  return (
    <>
      <ErrorAlert
        title="Failed to process service request"
        message={errorState ? (errorState.error ?? undefined) : undefined}
      />

      <div className="bg-background text-foreground flex flex-col">
        {/* Form Main Canvas */}
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-primary">Service Settings</h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded uppercase tracking-wide border ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {service.status}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={statusPending}
                onClick={() => changeStatus(service.id, !isActive)}
                className="gap-2 border-border bg-card hover:bg-muted text-xs h-9"
              >
                {statusPending ? (
                  <Spinner className="size-4" />
                ) : isActive ? (
                  <EyeOffIcon className="size-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="size-4 text-primary" />
                )}
                <span>{isActive ? "Deactivate" : "Activate"}</span>
              </Button>
            </div>
          </div>

          <form action={formAction} key={`${service.id}-${service.status}-${resetKey}`} id="edit-service-form" className="space-y-6">
            <input type="hidden" name="id" value={service.id} />
            {service.categoryId && (
              <input type="hidden" name="categoryId" value={service.categoryId} />
            )}

            <GeneralInfoSection
              defaultValues={{
                name: service.name,
                description: service.description,
              }}
            />

            <FinancialsAndLogisticsSection
              defaultValues={{
                price: service.price,
                durationMinutes: service.durationMinutes,
                preparationMinutes: service.preparationMinutes,
                cleanupMinutes: service.cleanupMinutes,
              }}
            />

            <InstructionsSection
              defaultValues={{
                preServiceInstructions: service.preServiceInstructions,
                postServiceRecommendations: service.postServiceRecommendations,
              }}
            />

            {/* Actions Inside Form */}
            <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
              <Button
                type="button"
                variant="destructive"
                disabled={isActionPending}
                onClick={() => deleteService(service.id)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {deletePending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Deleting...
                  </>
                ) : (
                  "Delete Service"
                )}
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    setResetKey((prev) => prev + 1);
                    router.push("/catalog");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isActionPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                >
                  {updatePending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
