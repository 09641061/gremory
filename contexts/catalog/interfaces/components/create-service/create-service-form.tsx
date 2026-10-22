"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { useCreateCatalogService } from "../../hooks/use-create-catalog-service";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { useCatalogTranslations } from "../../i18n";

interface CreateServiceFormProps {
  establishmentId: string;
  categoryId?: string;
  categories: CategoryDTO[];
  currency?: "USD" | "PEN";
  onSuccess?: (service: DetailedServiceDTO) => void;
  onCancel?: () => void;
}

export function CreateServiceForm({
  establishmentId,
  categoryId,
  categories,
  currency = "USD",
  onSuccess,
  onCancel,
}: CreateServiceFormProps) {
  const { t } = useCatalogTranslations();
  const router = useRouter();
  const { state, formAction, pending } = useCreateCatalogService((service) => {
    if (onSuccess) {
      onSuccess(service);
      return;
    }

    const params = new URLSearchParams();
    if (establishmentId) params.set("establishmentId", establishmentId);
    params.set("serviceId", service.id);
    router.push(`/catalog?${params.toString()}`);
  });

  return (
    <div className="w-full space-y-4">
      <ErrorAlert
        title={t.serviceForm.failedToCreateService}
        message={state.status === "error" && !pending ? (state.error ?? undefined) : undefined}
      />

      <form action={formAction} id="create-service-form">
        <Card className="rounded-lg border-border bg-card p-6 shadow-sm">
          <CardContent className="p-0 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">{t.serviceForm.createTitle}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t.serviceForm.createSubtitle}
              </p>
            </div>

            <input type="hidden" name="establishmentId" value={establishmentId} />

            <GeneralInfoSection
              categories={categories}
              defaultValues={{ categoryId }}
              disabled={pending}
            />

            <FinancialsAndLogisticsSection
              currency={currency}
              disabled={pending}
            />

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-border">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={onCancel}
                >
                  {t.serviceForm.cancel}
                </Button>
              )}

              <Button
                type="submit"
                disabled={pending || categories.length === 0}
                className="gap-2"
              >
                {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                {pending ? t.serviceForm.saving : t.serviceForm.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
