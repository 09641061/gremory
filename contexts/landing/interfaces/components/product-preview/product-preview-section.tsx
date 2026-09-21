"use client";

import { useState } from "react";
import { useLandingI18n } from "@/contexts/landing/interfaces/i18n";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/contexts/shared/interfaces/components/ui/tabs";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@/contexts/shared/interfaces/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/contexts/shared/interfaces/components/ui/message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/contexts/shared/interfaces/components/ui/card";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
import { Calendar } from "@/contexts/shared/interfaces/components/ui/calendar";
import { KoduAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
import {
  MessageSquareIcon,
  CalendarDaysIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  ClockIcon,
  TrendingUpIcon,
  SparklesIcon,
  SendIcon,
  UserIcon,
} from "lucide-react";

export function ProductPreviewSection() {
  const { t } = useLandingI18n();
  const preview = t.landing.preview;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <section id="product-preview" className="py-16 lg:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {preview.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {preview.description}
          </p>
        </div>

        {/* Tabs Control */}
        <Tabs defaultValue="chat" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl border border-border/60">
              <TabsTrigger
                value="chat"
                className="gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <MessageSquareIcon className="size-4 text-primary" />
                <span>{preview.tabs.chat}</span>
              </TabsTrigger>

              <TabsTrigger
                value="schedule"
                className="gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <CalendarDaysIcon className="size-4 text-muted-foreground" />
                <span>{preview.tabs.schedule}</span>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <BarChart3Icon className="size-4 text-muted-foreground" />
                <span>{preview.tabs.analytics}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: Chat Preview */}
          <TabsContent value="chat" className="mt-0">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
              {/* Chat Window Top Bar */}
              <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <KoduAvatar iconSize={20} className="size-8 bg-primary/10 border-primary/20" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {preview.chatDemo.title}
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {preview.chatDemo.online}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  IA Activa
                </div>
              </div>

              {/* Chat Conversation Body */}
              <div className="p-5 sm:p-7 space-y-5 bg-background/50">
                {/* 1. Client Message */}
                <Message align="end">
                  <MessageContent>
                    <MessageHeader className="text-xs text-muted-foreground">Cliente • 10:14 AM</MessageHeader>
                    <Bubble align="end" variant="default">
                      <BubbleContent className="bg-primary text-primary-foreground font-medium text-sm">
                        {preview.chatDemo.userMsg1}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                  <MessageAvatar className="bg-muted text-muted-foreground">
                    <UserIcon className="size-3.5" />
                  </MessageAvatar>
                </Message>

                {/* 2. Kodu Response */}
                <Message align="start">
                  <MessageAvatar className="bg-transparent">
                    <KoduAvatar iconSize={18} className="size-7" />
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader className="text-xs text-muted-foreground">Kodu AI • 10:14 AM</MessageHeader>
                    <BubbleGroup>
                      <Bubble align="start" variant="muted">
                        <BubbleContent className="bg-card border border-border/60 text-foreground text-sm">
                          {preview.chatDemo.koduMsg1}
                        </BubbleContent>
                      </Bubble>
                    </BubbleGroup>
                  </MessageContent>
                </Message>

                {/* 3. Client Reply */}
                <Message align="end">
                  <MessageContent>
                    <MessageHeader className="text-xs text-muted-foreground">Cliente • 10:15 AM</MessageHeader>
                    <Bubble align="end" variant="default">
                      <BubbleContent className="bg-primary text-primary-foreground font-medium text-sm">
                        {preview.chatDemo.userMsg2}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                  <MessageAvatar className="bg-muted text-muted-foreground">
                    <UserIcon className="size-3.5" />
                  </MessageAvatar>
                </Message>

                {/* 4. Kodu Final Confirmation */}
                <Message align="start">
                  <MessageAvatar className="bg-transparent">
                    <KoduAvatar iconSize={18} className="size-7" />
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader className="text-xs text-muted-foreground">Kodu AI • 10:15 AM</MessageHeader>
                    <BubbleGroup>
                      <Bubble align="start" variant="muted">
                        <BubbleContent className="bg-card border border-border/60 text-foreground text-sm">
                          {preview.chatDemo.koduMsg2}
                        </BubbleContent>
                      </Bubble>

                      {/* Confirmation Ticket Card inside Bubble */}
                      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2Icon className="size-3.5" />
                            <span>{preview.chatDemo.statusConfirmed}</span>
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            ID #TK-8492
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {preview.chatDemo.appointmentDetail}
                        </p>
                      </div>
                    </BubbleGroup>
                    <MessageFooter className="text-xs text-muted-foreground pt-1">Confirmación enviada vía WhatsApp &amp; Email</MessageFooter>
                  </MessageContent>
                </Message>
              </div>

              {/* Chat Input Placeholder Bar */}
              <div className="border-t border-border/40 bg-card p-3.5 flex items-center gap-2.5">
                <input
                  type="text"
                  disabled
                  placeholder={preview.chatDemo.typingPrompt}
                  className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs sm:text-sm text-muted-foreground outline-none"
                />
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <SendIcon className="size-3.5" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Schedule Preview */}
          <TabsContent value="schedule" className="mt-0">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card shadow-xs p-6 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Mini Calendar */}
                <div className="md:col-span-5 flex flex-col items-center border border-border/40 rounded-xl p-3 bg-muted/20">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CalendarDaysIcon className="size-3.5 text-primary" />
                    Calendario en Vivo
                  </h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg"
                  />
                </div>

                {/* Right Appointments List */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {preview.scheduleDemo.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {preview.scheduleDemo.availableSlots}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {preview.scheduleDemo.today}
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {preview.scheduleDemo.appointments.map((apt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:border-border transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center size-10 rounded-md bg-muted/60 text-foreground font-semibold text-xs">
                            <ClockIcon className="size-3 text-muted-foreground mb-0.5" />
                            <span>{apt.time.split(" ")[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {apt.client}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.service} • <span className="font-medium text-foreground/80">{apt.staff}</span>
                            </p>
                          </div>
                        </div>

                        <StatusBadge
                          tone={
                            (apt.status as string) === "Confirmado" ||
                            (apt.status as string) === "Confirmed"
                              ? "success"
                              : "neutral"
                          }
                          className="text-xs"
                        >
                          {apt.status}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Analytics Preview */}
          <TabsContent value="analytics" className="mt-0">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card shadow-xs p-6 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {preview.analyticsDemo.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Actualizado en tiempo real por el motor de Takodu
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs gap-1 border-border/60">
                  <TrendingUpIcon className="size-3 text-primary" />
                  Rendimiento Alto
                </Badge>
              </div>

              {/* 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="bg-muted/20 border-border/60">
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      {preview.analyticsDemo.totalRevenue}
                    </CardDescription>
                    <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                      {preview.analyticsDemo.revenueValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUpIcon className="size-3" />
                      {preview.analyticsDemo.revenueChange}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/60">
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      {preview.analyticsDemo.appointmentsCount}
                    </CardDescription>
                    <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                      {preview.analyticsDemo.appointmentsValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {preview.analyticsDemo.appointmentsChange}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/20 border-border/60">
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      {preview.analyticsDemo.activeClients}
                    </CardDescription>
                    <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                      {preview.analyticsDemo.activeClientsValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <SparklesIcon className="size-3 text-primary" />
                      {preview.analyticsDemo.activeClientsChange}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Insight Bar */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BarChart3Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {preview.analyticsDemo.popularService}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      {preview.analyticsDemo.popularServiceName}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Recomendación: Ampliar horarios
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
