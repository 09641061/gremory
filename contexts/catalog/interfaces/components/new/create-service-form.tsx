"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { InstructionsSection } from "./instructions-section";
import { useCreateCatalogService } from "../../../application/use-cases/use-create-catalog-service";

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
                  <Link href="/catalog" passHref>
                    <Button type="button" variant="ghost" disabled={pending}>
                      Cancel
                    </Button>
                  </Link>

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
        </main>
      </div>
    </>
  );
}
