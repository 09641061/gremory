"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { InstructionsSection } from "./instructions-section";
import {
  updateCatalogServiceAction,
  type CatalogServiceActionResult,
} from "../actions/manage-catalog-service.actions";
import type { DetailedServiceDTO } from "./service-detail-view";

interface EditServiceFormProps {
  service: DetailedServiceDTO;
}

export function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateCatalogServiceAction,
    { status: "idle", error: null } satisfies CatalogServiceActionResult
  );

  useEffect(() => {
    if (state.status === "success") {
      router.push("/catalog");
    }
  }, [state.status, router]);

  return (
    <>
      <ErrorAlert
        title="Failed to update service"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-40 flex justify-between items-center px-8 h-16 bg-card border-b border-border">
          <h1 className="text-xl font-bold text-[#00b77a]">Edit Service</h1>
          <Link href="/catalog" passHref>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted">
              <XIcon className="size-5" />
            </Button>
          </Link>
        </header>

        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8 pb-32">
          <form action={formAction} id="edit-service-form" className="space-y-6">
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
          </form>
        </main>

        <footer className="fixed bottom-0 left-0 w-full bg-card border-t border-border px-8 py-4 z-40">
          <div className="max-w-[800px] mx-auto flex justify-between items-center">
            <Link href="/catalog" passHref>
              <Button type="button" variant="ghost" className="text-muted-foreground">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              form="edit-service-form"
              disabled={pending}
              className="bg-[#00b77a] hover:bg-[#00b77a]/90 text-white font-semibold px-8"
            >
              {pending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}
