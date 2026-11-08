"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { GeneralInfoSection } from "../create-service/general-info-section";
import { FinancialsAndLogisticsSection } from "../create-service/financials-and-logistics-section";
import { useUpdateCatalogService } from "../../hooks/use-update-catalog-service";
import { useChangeCatalogServiceStatus } from "../../hooks/use-change-catalog-service-status";
import { DeleteServiceDialog } from "./delete-service-dialog";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { useCatalogTranslations } from "../../i18n";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
  establishmentId?: string;
  categories?: CategoryDTO[];
  currency?: "USD" | "PEN";
  onCancel?: () => void;
  onDeleted?: () => void;
  onSuccess?: (service?: DetailedServiceDTO | null) => void;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export function EditServiceForm({
  service,
  establishmentId,
  categories = [],
  currency = "USD",
  onCancel,
  onDeleted,
  onSuccess,
  canUpdateService,
  canDeleteService,
}: EditServiceFormProps) {
  const { t } = useCatalogTranslations();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { changeStatus, pending: statusPending, state: statusState } = useChangeCatalogServiceStatus();
  const { state: updateState, formAction, pending: updatePending } = useUpdateCatalogService(onSuccess);

  const isActive = service.status === "ACTIVE";

  const errorState =
    updateState.status === "error"
      ? updateState
      : statusState.status === "error"
      ? statusState
      : null;

  const isActionPending = updatePending || statusPending;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/catalog");
    }
  };

  const defaultsKey = JSON.stringify([
    service.name,
    service.description,
    service.categoryId,
    service.price,
    service.durationMinutes,
    service.preparationMinutes,
    service.cleanupMinutes,
  ]);

  return (
    <>
      <ErrorAlert
        title={t.serviceForm.failedToUpdateService}
        message={errorState && !isActionPending ? (errorState.error ?? undefined) : undefined}
      />

      <div className="w-full space-y-4">
        <form
          action={formAction}
          key={`${service.id}-${service.status}-${defaultsKey}`}
          id="edit-service-form"
        >
          <Card className="rounded-lg border-border bg-card p-6 shadow-sm">
            <CardContent className="p-0 space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t.serviceForm.editTitle}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{service.name}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isActive ? t.serviceForm.active : t.serviceForm.inactive}
                    </span>
                    <Switch
                      checked={isActive}
                      disabled={!canUpdateService || isActionPending}
                      onCheckedChange={(checked) => {
                        changeStatus(service.id, checked, service.establishmentId);
                      }}
                      aria-label="Toggle service active status"
                    />
                  </div>
                </div>
              </div>

              <input type="hidden" name="id" value={service.id} />
              <input type="hidden" name="establishmentId" value={service.establishmentId || establishmentId || ""} />

              <fieldset disabled={!canUpdateService || isActionPending} className="space-y-6">
                <GeneralInfoSection
                  categories={categories}
                  defaultValues={{
                    name: service.name,
                    description: service.description,
                    categoryId: service.categoryId,
                  }}
                  disabled={!canUpdateService || isActionPending}
                />

                <FinancialsAndLogisticsSection
                  currency={currency}
                  defaultValues={{
                    price: service.price,
                    durationMinutes: service.durationMinutes,
                    preparationMinutes: service.preparationMinutes,
                    cleanupMinutes: service.cleanupMinutes,
                  }}
                  disabled={!canUpdateService || isActionPending}
                />
              </fieldset>

              <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
                {canDeleteService ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                    disabled={isActionPending}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    <span>{t.serviceForm.delete}</span>
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isActionPending}
                    onClick={handleCancel}
                  >
                    {t.serviceForm.cancel}
                  </Button>

                  {canUpdateService && (
                    <FormSubmitButton
                      isSubmitting={isActionPending}
                      icon={<Save className="size-4" />}
                      disabled={isActionPending}
                    >
                      {isActionPending ? t.serviceForm.saving : t.serviceForm.save}
                    </FormSubmitButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {isDeleteDialogOpen && (
        <DeleteServiceDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          serviceId={service.id}
          serviceName={service.name}
          establishmentId={service.establishmentId || establishmentId}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            if (onDeleted) onDeleted();
          }}
        />
      )}
    </>
  );
}
