"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Save, Trash2 } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { GeneralInfoSection } from "../new/general-info-section";
import { FinancialsAndLogisticsSection } from "../new/financials-and-logistics-section";
import { InstructionsSection } from "../new/instructions-section";
import { useUpdateCatalogService } from "../../hooks/use-update-catalog-service";
import { useChangeCatalogServiceStatus } from "../../hooks/use-change-catalog-service-status";
import { DeleteServiceDialog } from "./delete-service-dialog";
import type { DetailedServiceDTO } from "./service-detail-view";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
  onCancel?: () => void;
  /** Runs once the service is gone, so the list around it can forget it. */
  onDeleted?: () => void;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export function EditServiceForm({
  service,
  onCancel,
  onDeleted,
  canUpdateService,
  canDeleteService,
}: EditServiceFormProps) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { changeStatus, pending: statusPending, state: statusState } = useChangeCatalogServiceStatus();
  const { state: updateState, formAction, pending: updatePending } = useUpdateCatalogService();

  const isActive = service.status === "ACTIVE";

  // Combined error and loading state for actions
  const errorState = 
    updateState.status === "error" 
      ? updateState 
      : statusState.status === "error"
      ? statusState
      : null;

  const isActionPending = updatePending || statusPending;

  // The fields are uncontrolled, so their `defaultValue` must stay stable while mounted.
  // Remount the form whenever the server data behind those defaults changes (e.g. after
  // a save triggers router.refresh()).
  const defaultsKey = JSON.stringify([
    service.name,
    service.description,
    service.price,
    service.durationMinutes,
    service.preparationMinutes,
    service.cleanupMinutes,
    service.preServiceInstructions ?? "",
    service.postServiceRecommendations ?? "",
  ]);

  return (
    <>
      <ErrorAlert
        title="Failed to process service request"
        message={errorState && !isActionPending ? (errorState.error ?? undefined) : undefined}
      />

      <div className="bg-background text-foreground flex flex-col">
        {/* Form Main Canvas */}
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <form action={formAction} key={`${service.id}-${service.status}-${defaultsKey}-${resetKey}`} id="edit-service-form">
            <Card className="rounded-lg border-border bg-card p-6">
              <CardContent className="p-0 space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h1 className="text-xl font-bold text-foreground">Service Settings</h1>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        isActive
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      <span
                        className={`size-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground"}`}
                      />
                      {isActive ? "Active" : service.status === "DELETED" ? "Deleted" : "Inactive"}
                    </Badge>

                    {(canUpdateService || canDeleteService) && (
                      <EntityActionsMenu
                        label={`More actions for ${service.name}`}
                        size="icon-sm"
                        disabled={statusPending || isActionPending}
                        actions={[
                          {
                            label: isActive ? "Deactivate" : "Activate",
                            icon: isActive ? EyeOffIcon : EyeIcon,
                            hidden: !canUpdateService,
                            disabled: statusPending,
                            onSelect: () => changeStatus(service.id, !isActive),
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            variant: "destructive",
                            hidden: !canDeleteService,
                            onSelect: () => setIsDeleteDialogOpen(true),
                          },
                        ]}
                      />
                    )}
                  </div>
                </div>

                <input type="hidden" name="id" value={service.id} />
                {service.categoryId && (
                  <input type="hidden" name="categoryId" value={service.categoryId} />
                )}

                <fieldset disabled={!canUpdateService} className="space-y-6 w-full">
                  <GeneralInfoSection
                    defaultValues={{
                      name: service.name,
                      description: service.description,
                    }}
                    disabled={!canUpdateService}
                  />

                  <FinancialsAndLogisticsSection
                    defaultValues={{
                      price: service.price,
                      durationMinutes: service.durationMinutes,
                      preparationMinutes: service.preparationMinutes,
                      cleanupMinutes: service.cleanupMinutes,
                    }}
                    disabled={!canUpdateService}
                  />

                  <InstructionsSection
                    defaultValues={{
                      preServiceInstructions: service.preServiceInstructions,
                      postServiceRecommendations: service.postServiceRecommendations,
                    }}
                    disabled={!canUpdateService}
                  />
                </fieldset>

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

                  {canUpdateService && (
                    <Button
                      type="submit"
                      disabled={isActionPending}
                      className="gap-2"
                    >
                      {updatePending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                      {updatePending ? "Saving..." : "Save"}
                    </Button>
                  )}
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
        onSuccess={onDeleted ?? onCancel}
      />
    </>
  );
}
