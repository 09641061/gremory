"use client";

import { useState } from "react";
import Link from "next/link";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/contexts/shared/interfaces/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/contexts/shared/interfaces/components/ui/table";
import { KoduAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
import {
  CheckIcon,
  XIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "lucide-react";

interface FeatureRow {
  name: string;
  tooltip?: string;
  standard: string | boolean;
  max: string | boolean;
}

interface FeatureCategory {
  category: string;
  features: FeatureRow[];
}

export function PricingPageView() {
  const { t } = useLandingI18n();
  const pricing = t.landing.pricing;

  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "PEN">("USD");

  const plans = [
    {
      id: "standard",
      name: pricing.standard.name,
      description: pricing.standard.description,
      price: isYearly
        ? currency === "USD"
          ? pricing.standard.priceYearlyUSD
          : pricing.standard.priceYearlyPEN
        : currency === "USD"
          ? pricing.standard.priceMonthlyUSD
          : pricing.standard.priceMonthlyPEN,
      period: pricing.standard.period,
      billedNote: isYearly
        ? currency === "USD"
          ? pricing.standard.billedAnnuallyUSD
          : pricing.standard.billedAnnuallyPEN
        : null,
      features: pricing.standard.features,
      cta: pricing.standard.cta,
      ctaHref: "/login",
      popular: false,
      buttonVariant: "outline" as const,
    },
    {
      id: "max",
      name: pricing.max.name,
      description: pricing.max.description,
      price: isYearly
        ? currency === "USD"
          ? pricing.max.priceYearlyUSD
          : pricing.max.priceYearlyPEN
        : currency === "USD"
          ? pricing.max.priceMonthlyUSD
          : pricing.max.priceMonthlyPEN,
      period: pricing.max.period,
      billedNote: isYearly
        ? currency === "USD"
          ? pricing.max.billedAnnuallyUSD
          : pricing.max.billedAnnuallyPEN
        : null,
      features: pricing.max.features,
      cta: pricing.max.cta,
      ctaHref: "/login?next=/upgrade",
      popular: true,
      buttonVariant: "default" as const,
    },
  ];

  const comparisonCategories: FeatureCategory[] = [
    {
      category: "Capacidad & Organización",
      features: [
        { name: "Establecimientos incluidos", standard: "1 establecimiento", max: "Ilimitados" },
        { name: "Sedes y sucursales", standard: "1 sede", max: "Ilimitadas" },
        { name: "Colaboradores / Profesionales", standard: "Hasta 3", max: "Ilimitados" },
        { name: "Base de datos de clientes", standard: "Hasta 1,000", max: "Ilimitada" },
        { name: "Roles y permisos de equipo", standard: "Básico", max: "Avanzado granular" },
      ],
    },
    {
      category: "Asistente Inteligente Kodu IA",
      features: [
        { name: "Consultas y respuestas 24/7", standard: true, max: true },
        { name: "Capacidad de mensajes al mes", standard: "500 msgs/mes", max: "Ilimitados" },
        { name: "Agendamiento automático por chat", standard: true, max: true },
        { name: "Integración Multicanal (Web + WhatsApp)", standard: "Solo Web", max: "Web + WhatsApp" },
        { name: "Sugerencias y recordatorios proactivos", standard: false, max: true },
        { name: "Análisis conversacional de intenciones", standard: false, max: true },
      ],
    },
    {
      category: "Agenda & Turnos",
      features: [
        { name: "Calendario interactivo en tiempo real", standard: true, max: true },
        { name: "Vista multi-profesional simultánea", standard: true, max: true },
        { name: "Control de solapamientos y descansos", standard: true, max: true },
        { name: "Recordatorios automáticos por correo", standard: true, max: true },
        { name: "Recordatorios automáticos por WhatsApp", standard: false, max: true },
        { name: "Cancelaciones y reprogramaciones auto", standard: true, max: true },
      ],
    },
    {
      category: "CRM & Fidelización",
      features: [
        { name: "Ficha única de cliente y contacto", standard: true, max: true },
        { name: "Historial completo de citas y servicios", standard: true, max: true },
        { name: "Notas personalizadas y preferencias", standard: true, max: true },
        { name: "Segmentación por frecuencia y gasto", standard: false, max: true },
        { name: "Campañas de reactivación de clientes", standard: false, max: true },
      ],
    },
    {
      category: "Métricas, Analíticas & Finanzas",
      features: [
        { name: "Dashboard de ingresos en tiempo real", standard: true, max: true },
        { name: "Reporte de servicios más solicitados", standard: true, max: true },
        { name: "Rendimiento por colaborador", standard: "Básico", max: "Avanzado" },
        { name: "Tasa de retención y recurrencia", standard: false, max: true },
        { name: "Exportación de datos (CSV / Excel)", standard: true, max: true },
        { name: "Gestión de facturación y recibos", standard: true, max: true },
      ],
    },
    {
      category: "Soporte, Seguridad & Garantía",
      features: [
        { name: "Cifrado de datos de extremo a extremo", standard: true, max: true },
        { name: "Copias de seguridad diarias automáticas", standard: true, max: true },
        { name: "Disponibilidad del servicio (SLA)", standard: "99.5%", max: "99.9%" },
        { name: "Canales de soporte", standard: "Email (24-48h)", max: "WhatsApp & Email prioritario (24/7)" },
        { name: "Sesión de onboarding guiado", standard: false, max: true },
        { name: "Gestor de cuenta dedicado", standard: false, max: true },
      ],
    },
  ];

  const billingFaqs = [
    {
      question: "¿Cómo funciona la prueba gratuita de 14 días?",
      answer:
        "Puedes registrarte y probar todas las funcionalidades de Takodu gratis durante 14 días. No te solicitaremos tarjeta de crédito para iniciar y no hay cobros ocultos. Si decides no continuar, tu cuenta pasará a pausa sin ningún cargo.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express, Diners) procesadas de manera segura a través de Stripe. En Perú también soportamos pagos en Soles (PEN) y transferencias bancarias empresariales para planes anuales.",
    },
    {
      question: "¿Puedo cambiar de plan o cancelar en cualquier momento?",
      answer:
        "¡Sí! Puedes cambiar de Standard a Max (o viceversa) en cualquier momento desde tu panel de configuración. Los cambios se prorratean automáticamente. Asimismo, puedes cancelar tu suscripción en cualquier instante con un solo clic.",
    },
    {
      question: "¿Emiten comprobantes fiscales o facturas electrónicas?",
      answer:
        "Sí. Para todos los pagos emitimos recibos e invoice descargables inmediatamente en formato PDF. Si necesitas factura electrónica con RUC o datos de tu empresa, puedes configurarlos en la sección de facturación.",
    },
    {
      question: "¿Existe algún compromiso de permanencia?",
      answer:
        "Ninguno. Los planes mensuales se renuevan mes a mes y los planes anuales se abonan una vez al año con un 20% de descuento. Tienes el control total sobre tu suscripción.",
    },
  ];

  const renderCellValue = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="flex justify-center">
          <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckIcon className="size-3.5 stroke-[3]" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex size-5 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/40">
            <XIcon className="size-3 stroke-[2.5]" />
          </div>
        </div>
      );
    }
    return <span className="text-xs sm:text-sm font-medium text-foreground">{val}</span>;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Header & Hero */}
      <section className="pt-12 pb-14 md:pt-16 md:pb-18 relative bg-muted/20 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {pricing.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {pricing.description}
          </p>

          {/* Toggles (Monthly/Yearly & Currency) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-5">
            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center gap-3 bg-card border border-border/60 px-3.5 py-1.5 rounded-full shadow-xs">
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  !isYearly ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {pricing.monthly}
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                aria-label="Toggle annual billing"
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isYearly ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {pricing.yearly}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                {pricing.saveBadge}
              </span>
            </div>

            {/* Currency Toggle (USD / PEN) */}
            <div className="flex items-center rounded-full border border-border/60 bg-card p-0.5 text-xs font-medium shadow-xs">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-full px-3 py-1 transition-all ${
                  currency === "USD"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("PEN")}
                className={`rounded-full px-3 py-1 transition-all ${
                  currency === "PEN"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                PEN (S/.)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-14 md:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between overflow-hidden transition-all duration-200 rounded-2xl bg-card ${
                plan.popular
                  ? "border-2 border-primary/80 shadow-md"
                  : "border border-border/60 shadow-xs hover:border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <SparklesIcon className="size-3" />
                    {pricing.popularBadge}
                  </div>
                </div>
              )}

              <CardHeader className="space-y-2.5 pt-7 pb-5 px-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {plan.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </CardDescription>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                    {plan.period}
                  </span>
                </div>

                {plan.billedNote && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {plan.billedNote}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4 flex-1 px-6 sm:px-8">
                <div className="pt-3 border-t border-border/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Características principales:
                  </p>
                  <ul className="space-y-2.5 text-sm text-foreground">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                          <CheckIcon className="size-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm leading-snug text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-4 pb-7 px-6 sm:px-8 bg-transparent">
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  nativeButton={false}
                  className={`w-full justify-center gap-2 h-11 text-xs sm:text-sm font-semibold shadow-xs ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border/80 text-foreground hover:bg-muted/50"
                  }`}
                  render={<Link href={plan.ctaHref} />}
                >
                  <span>{plan.cta}</span>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Full Feature Comparison Table */}
      <section className="py-14 md:py-20 bg-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Compara todas las características
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Revisa punto por punto qué incluye cada plan y encuentra la solución perfecta para tu negocio.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/60 hover:bg-transparent">
                  <TableHead className="w-1/2 py-3 px-5 text-xs font-semibold text-foreground">
                    Funcionalidad
                  </TableHead>
                  <TableHead className="w-1/4 py-3 px-5 text-center text-xs font-semibold text-foreground">
                    <div className="flex flex-col items-center">
                      <span>Standard</span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {isYearly
                          ? currency === "USD"
                            ? "$15/mes"
                            : "S/. 55/mes"
                          : currency === "USD"
                            ? "$19/mes"
                            : "S/. 69/mes"}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-1/4 py-3 px-5 text-center text-xs font-semibold text-primary">
                    <div className="flex flex-col items-center">
                      <span className="flex items-center gap-1">
                        Max
                        <SparklesIcon className="size-3 text-primary" />
                      </span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {isYearly
                          ? currency === "USD"
                            ? "$39/mes"
                            : "S/. 143/mes"
                          : currency === "USD"
                            ? "$49/mes"
                            : "S/. 179/mes"}
                      </span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {comparisonCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="contents">
                    {/* Category Header Row */}
                    <TableRow className="bg-muted/20 border-y border-border/40 hover:bg-muted/20">
                      <TableCell
                        colSpan={3}
                        className="py-2.5 px-5 text-[11px] font-bold uppercase tracking-wider text-primary"
                      >
                        {cat.category}
                      </TableCell>
                    </TableRow>

                    {/* Features under Category */}
                    {cat.features.map((row, rowIdx) => (
                      <TableRow
                        key={rowIdx}
                        className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="py-3 px-5 text-xs sm:text-sm font-medium text-foreground">
                          {row.name}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-center">
                          {renderCellValue(row.standard)}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-center bg-primary/5">
                          {renderCellValue(row.max)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </div>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Billing & Payments FAQ */}
      <section className="py-14 md:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Preguntas frecuentes sobre pagos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Resolvemos tus dudas sobre suscripciones, ciclos de cobro y cancelaciones.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-xs">
          <Accordion defaultValue={["item-0"]} className="w-full space-y-1">
            {billingFaqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border-b border-border/40 pb-2 pt-1 last:border-b-0 last:pb-0"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-2.5 px-2 rounded-lg transition-colors hover:bg-muted/30">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 pt-1 pb-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Checkout CTA Banner */}
      <section className="pb-16 lg:pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card p-8 sm:p-12 text-center shadow-xs">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-center">
              <KoduAvatar iconSize={24} className="size-10 bg-primary/10 border border-primary/20" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              ¿Listo para empezar a automatizar tu negocio?
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Empieza tu prueba gratuita de 14 días con el plan que elijas. Configuración en minutos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                nativeButton={false}
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 h-11 shadow-xs text-xs sm:text-sm"
                render={<Link href="/login" />}
              >
                <span>Comenzar prueba gratis</span>
                <ArrowRightIcon className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="w-full sm:w-auto border-border/80 text-foreground hover:bg-muted/50 font-medium px-5 h-11 text-xs sm:text-sm"
                render={<Link href="/login?next=/upgrade" />}
              >
                <span>Obtener Plan Max</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
              <ShieldCheckIcon className="size-3.5 text-primary shrink-0" />
              <span>Garantía de satisfacción • Cancela cuando quieras sin compromiso</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
