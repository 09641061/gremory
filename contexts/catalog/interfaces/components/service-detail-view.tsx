"use client";

import Link from "next/link";
import { EditIcon, ClockIcon, TimerIcon, SparklesIcon, CreditCardIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { useChangeCatalogServiceStatus } from "../../application/use-cases/use-change-catalog-service-status";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";

export type DetailedServiceDTO = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  preparationMinutes: number;
  cleanupMinutes: number;
  categoryId?: string | null;
  preServiceInstructions?: string | null;
  postServiceRecommendations?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
};

interface ServiceDetailViewProps {
  service: DetailedServiceDTO;
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  const { changeStatus, pending, state } = useChangeCatalogServiceStatus();
  const isActive = service.status === "ACTIVE";

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      <ErrorAlert
        title="Failed to change service status"
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      {/* Header Actions */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
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
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => changeStatus(service.id, !isActive)}
            className="gap-2 border-border bg-card hover:bg-muted"
          >
            {pending ? (
              <Spinner className="size-4" />
            ) : isActive ? (
              <EyeOffIcon className="size-4 text-muted-foreground" />
            ) : (
              <EyeIcon className="size-4 text-primary" />
            )}
            <span>{isActive ? "Deactivate" : "Activate"}</span>
          </Button>

          <Link href={`/catalog/${service.id}/edit`}>
            <Button variant="outline" className="gap-2 border-border bg-card hover:bg-muted">
              <EditIcon className="size-4 text-primary" />
              <span>Edit Service</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Core Info */}
        <div className="md:col-span-8 space-y-6">
          {/* Description Card */}
          <Card className="rounded-xl border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-semibold">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                  Description
                </label>
                <p className="text-sm text-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    Pre-service Instructions
                  </label>
                  <p className="text-sm text-foreground italic">
                    {service.preServiceInstructions || "No pre-service instructions."}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    Post-service Recommendations
                  </label>
                  <p className="text-sm text-foreground">
                    {service.postServiceRecommendations || "No post-service recommendations."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Times Card */}
          <Card className="rounded-xl border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-semibold">Operational Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg border border-border">
                  <ClockIcon className="size-5 text-sky-600 mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Preparation</span>
                  <span className="text-xl font-bold text-foreground mt-1">{service.preparationMinutes} min</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <TimerIcon className="size-5 text-primary mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Duration</span>
                  <span className="text-xl font-bold text-primary mt-1">{service.durationMinutes} min</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg border border-border">
                  <SparklesIcon className="size-5 text-rose-500 mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Cleanup</span>
                  <span className="text-xl font-bold text-foreground mt-1">{service.cleanupMinutes} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Commercial */}
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-xl border-border bg-card relative overflow-hidden">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Pricing</CardTitle>
              <CreditCardIcon className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="p-6 flex flex-col">
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Retail Price
              </label>
              <span className="text-3xl font-bold text-primary">
                ${service.price.toFixed(2)}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
