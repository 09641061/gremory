"use client";

import { useActionState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { GeneralInfoSection } from "./general-info-section";
import { FinancialsAndLogisticsSection } from "./financials-and-logistics-section";
import { InstructionsSection } from "./instructions-section";
import {
  createCatalogServiceAction,
  type CreateCatalogServiceActionState,
} from "../actions/create-catalog-service.action";

// TODO: Replace with dynamic establishment ID from context/session
const MOCK_ESTABLISHMENT_ID = "11223344-5566-7788-9900-aabbccddeeff";

interface CreateServiceFormProps {
  categories: Array<{ id: string; name: string }>;
}

export function CreateServiceForm({ categories }: CreateServiceFormProps) {
  const [state, formAction, pending] = useActionState(
    createCatalogServiceAction,
    { status: "idle", data: null, error: null } satisfies CreateCatalogServiceActionState
  );

  return (
    <>
      <ErrorAlert
        title="Failed to create service"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-8 h-16 bg-card border-b border-border">
          <h1 className="text-xl font-bold text-[#00b77a]">Create New Service</h1>
          <Link href="/catalog" passHref>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted">
              <XIcon className="size-5" />
            </Button>
          </Link>
        </header>

        {/* Form Main Canvas */}
        <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8 pb-32">
          <form action={formAction} id="create-service-form" className="space-y-6">
            <input type="hidden" name="establishmentId" value={MOCK_ESTABLISHMENT_ID} />

            <GeneralInfoSection categories={categories} />
            <FinancialsAndLogisticsSection />
            <InstructionsSection />
          </form>
        </main>

        {/* Fixed Footer Actions */}
        <footer className="fixed bottom-0 left-0 w-full bg-card border-t border-border px-8 py-4 z-40">
          <div className="max-w-[800px] mx-auto flex justify-between items-center">
            <Link href="/catalog" passHref>
              <Button type="button" variant="ghost" className="text-muted-foreground">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              form="create-service-form"
              disabled={pending}
              className="bg-[#00b77a] hover:bg-[#00b77a]/90 text-white font-semibold px-8"
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
        </footer>
      </div>
    </>
  );
}
