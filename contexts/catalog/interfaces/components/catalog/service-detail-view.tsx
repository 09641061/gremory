"use client";

import { useMemo } from "react";
import Link from "next/link";
import { EditIcon, ClockIcon, TimerIcon, SparklesIcon, CreditCardIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { useChangeCatalogServiceStatus } from "../../hooks/use-change-catalog-service-status";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { useCatalogTranslations } from "../../i18n";

export type DetailedServiceDTO = {
  id: string;
  establishmentId: string;
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
  const { t, locale } = useCatalogTranslations();
  const { changeStatus, pending, state } = useChangeCatalogServiceStatus();
  const isActive = service.status === "ACTIVE";

  const formattedPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(service.price);
    } catch {
      return `$${service.price.toFixed(2)}`;
    }
  }, [locale, service.price]);

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      <ErrorAlert
        title={t.serviceDetail.failedToChangeStatus}
        message={state.status === "error" ? (state.error ?? undefined) : undefined}
      />

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
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
            {isActive ? t.serviceForm.active : service.status === "DELETED" ? t.serviceForm.deleted : t.serviceForm.inactive}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => changeStatus(service.id, !isActive, service.establishmentId)}
            className="gap-2 border-border bg-card hover:bg-muted"
          >
            {pending ? (
              <Spinner className="size-4" />
            ) : isActive ? (
              <EyeOffIcon className="size-4 text-muted-foreground" />
            ) : (
              <EyeIcon className="size-4 text-primary" />
            )}
            <span>{isActive ? t.serviceForm.deactivate : t.serviceForm.activate}</span>
          </Button>

          <Link href={`/catalog/${service.id}/edit`}>
            <Button variant="outline" className="gap-2 border-border bg-card hover:bg-muted">
              <EditIcon className="size-4 text-primary" />
              <span>{t.serviceDetail.editService}</span>
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
              <CardTitle className="text-lg font-semibold">{t.serviceDetail.serviceDetailsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                  {t.serviceDetail.descriptionLabel}
                </label>
                <p className="text-sm text-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    {t.serviceDetail.preServiceLabel}
                  </label>
                  <p className="text-sm text-foreground italic">
                    {service.preServiceInstructions || t.serviceDetail.noPreService}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    {t.serviceDetail.postServiceLabel}
                  </label>
                  <p className="text-sm text-foreground">
                    {service.postServiceRecommendations || t.serviceDetail.noPostService}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Times Card */}
          <Card className="rounded-xl border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-semibold">{t.serviceDetail.operationalSchedule}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg border border-border">
                  <ClockIcon className="size-5 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{t.serviceDetail.preparation}</span>
                  <span className="text-xl font-bold text-foreground mt-1">
                    {t.serviceDetail.minutesSuffix.replace("{minutes}", String(service.preparationMinutes))}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <TimerIcon className="size-5 text-primary mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{t.serviceDetail.duration}</span>
                  <span className="text-xl font-bold text-primary mt-1">
                    {t.serviceDetail.minutesSuffix.replace("{minutes}", String(service.durationMinutes))}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg border border-border">
                  <SparklesIcon className="size-5 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{t.serviceDetail.cleanup}</span>
                  <span className="text-xl font-bold text-foreground mt-1">
                    {t.serviceDetail.minutesSuffix.replace("{minutes}", String(service.cleanupMinutes))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Commercial */}
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-xl border-border bg-card relative overflow-hidden">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">{t.serviceDetail.pricing}</CardTitle>
              <CreditCardIcon className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="p-6 flex flex-col">
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {t.serviceDetail.retailPrice}
              </label>
              <span className="text-3xl font-bold text-primary">
                {formattedPrice}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
