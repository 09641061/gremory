"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { InstructionsSection } from "./instructions-section";
import { useCreateCatalogService } from "../../hooks/use-create-catalog-service";
import type { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";

interface CreateServiceFormProps {
  establishmentId: string;
  categoryId?: string;
  onSuccess?: (service: DetailedServiceDTO) => void;
  onCancel?: () => void;
}

export function CreateServiceForm({ establishmentId, categoryId, onSuccess, onCancel }: CreateServiceFormProps) {
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
    <>
      <ErrorAlert
        title="Failed to create service"
        message={state.status === "error" && !pending ? (state.error ?? undefined) : undefined}
      />

      <div className="w-full bg-background text-foreground">
        <div className="mx-auto w-full max-w-[800px] px-4 py-8">
          <form action={formAction} id="create-service-form">
            <Card className="rounded-lg border-border bg-card p-6">
              <CardContent className="p-0 space-y-6">
                <div className="border-b border-border pb-4">
                  <h1 className="text-xl font-bold text-foreground">Create New Service</h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Add a new service to your catalog. Configure its details, pricing, logistics, and preparation times to start accepting bookings.
                  </p>
                </div>

                <input type="hidden" name="establishmentId" value={establishmentId} />
                {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}

                <GeneralInfoSection />
                <FinancialsAndLogisticsSection />
                <InstructionsSection />

                {/* Actions Inside Form */}
                <div className="flex justify-end items-center gap-3 pt-6 border-t border-border mt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
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
                    disabled={pending}
                    className="gap-2"
                  >
                    {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                    {pending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}
