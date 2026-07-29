"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Save, MoreVertical } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDeleteItem,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import { GeneralInfoSection } from "../new/general-info-section";
import { FinancialsAndLogisticsSection } from "../new/financials-and-logistics-section";
import { InstructionsSection } from "../new/instructions-section";
import { useUpdateCatalogService } from "../../../application/use-cases/use-update-catalog-service";
import { useChangeCatalogServiceStatus } from "../../../application/use-cases/use-change-catalog-service-status";
import { DeleteServiceDialog } from "./delete-service-dialog";
import type { DetailedServiceDTO } from "./service-detail-view";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
  onCancel?: () => void;
}

export function EditServiceForm({ service, onCancel }: EditServiceFormProps) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { changeStatus, pending: statusPending, state: statusState } = useChangeCatalogServiceStatus();
  const { state: updateState, formAction, pending: updatePending } = useUpdateCatalogService(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/catalog");
    }
  });

  const isActive = service.status === "ACTIVE";

  // Combined error and loading state for actions
  const errorState = 
    updateState.status === "error" 
      ? updateState 
      : statusState.status === "error"
      ? statusState
      : null;

  const isActionPending = updatePending || statusPending;

  return (
    <>
      <ErrorAlert
        title="Failed to process service request"
        message={errorState && !isActionPending ? (errorState.error ?? undefined) : undefined}
      />

      <div className="bg-background text-foreground flex flex-col">
        {/* Form Main Canvas */}
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <form action={formAction} key={`${service.id}-${service.status}-${resetKey}`} id="edit-service-form">
            <Card className="rounded-lg border-border bg-card p-6">
              <CardContent className="p-0 space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-foreground">Service Settings</h1>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={statusPending || isActionPending}
                        className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 h-8 w-8 p-0"
                      >
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => changeStatus(service.id, !isActive)}
                          disabled={statusPending}
                          className="gap-2 cursor-pointer"
                        >
                          {isActive ? (
                            <>
                              <EyeOffIcon className="size-3.5 text-muted-foreground" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <EyeIcon className="size-3.5 text-primary" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuDeleteItem
                          onClick={() => setIsDeleteDialogOpen(true)}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

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
                <div className="flex justify-end items-center gap-3 pt-6 border-t border-border mt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isActionPending}
                    onClick={() => {
                      setResetKey((prev) => prev + 1);
                      if (onCancel) {
                        onCancel();
                      } else {
                        router.push("/catalog");
                      }
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isActionPending}
                    className="gap-2"
                  >
                    {updatePending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                    {updatePending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>
      </div>

      <DeleteServiceDialog
        serviceId={service.id}
        serviceName={service.name}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={onCancel}
      />
    </>
  );
}
