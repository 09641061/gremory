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
import { useCreateCatalogService } from "../../application/use-cases/use-create-catalog-service";

interface CreateServiceFormProps {
  establishmentId: string;
  categoryId?: string;
}

export function CreateServiceForm({ establishmentId, categoryId }: CreateServiceFormProps) {
  const router = useRouter();
  const { state, formAction, pending } = useCreateCatalogService(() => {
    router.push("/catalog");
  });

  return (
    <>
      <ErrorAlert
        title="Failed to create service"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      <div className="bg-background text-foreground flex flex-col">
        {/* Form Main Canvas */}
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-primary">Create New Service</h1>
            <Link href="/catalog" passHref>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted">
                <XIcon className="size-5" />
              </Button>
            </Link>
          </div>

          <form action={formAction} id="create-service-form" className="space-y-6">
            <input type="hidden" name="establishmentId" value={establishmentId} />
            {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}

            <GeneralInfoSection />
            <FinancialsAndLogisticsSection />
            <InstructionsSection />

            {/* Actions Inside Form */}
            <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
              <Link href="/catalog" passHref>
                <Button type="button" variant="ghost" className="text-muted-foreground">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={pending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                {pending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Creating...
                  </>
                ) : (
                  "Create Service"
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
