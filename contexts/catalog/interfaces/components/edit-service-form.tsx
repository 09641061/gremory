"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { InstructionsSection } from "./instructions-section";
import { useUpdateCatalogService } from "../../application/use-cases/use-update-catalog-service";
import { useDeleteCatalogService } from "../../application/use-cases/use-delete-catalog-service";
import type { DetailedServiceDTO } from "./service-detail-view";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
}

export function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const { state: updateState, formAction, pending: updatePending } = useUpdateCatalogService(() => {
    router.push("/catalog");
  });
  const { deleteService, pending: deletePending, state: deleteState } = useDeleteCatalogService(() => {
    router.push("/catalog");
  });

  // Combined error and loading state for actions
  const errorState = updateState.status === "error" ? updateState : deleteState.status === "error" ? deleteState : null;
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
            <h1 className="text-xl font-bold text-primary">Edit Service</h1>
            <Link href="/catalog" passHref>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted">
                <XIcon className="size-5" />
              </Button>
            </Link>
          </div>

          <form action={formAction} key={service.id} id="edit-service-form" className="space-y-6">
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
                <Link href="/catalog" passHref>
                  <Button type="button" variant="ghost" className="text-muted-foreground">
                    Cancel
                  </Button>
                </Link>

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
