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
import { InfoBadge } from "@/contexts/shared/interfaces/components/ui/info-badge";
import { Calendar } from "@/contexts/shared/interfaces/components/ui/calendar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
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
    <section id="product-preview" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <InfoBadge className="mx-auto uppercase tracking-wider text-[10px]">
            {preview.tag}
          </InfoBadge>
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
            <TabsList className="bg-muted/80 p-1.5 rounded-xl border border-border/60 shadow-xs">
              <TabsTrigger
                value="chat"
                className="gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <MessageSquareIcon className="size-4 text-primary" />
                <span>{preview.tabs.chat}</span>
              </TabsTrigger>

              <TabsTrigger
                value="schedule"
                className="gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <CalendarDaysIcon className="size-4 text-blue-500" />
                <span>{preview.tabs.schedule}</span>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <BarChart3Icon className="size-4 text-amber-500" />
                <span>{preview.tabs.analytics}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: Chat Preview */}
          <TabsContent value="chat" className="mt-0">
            <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden">
              {/* Chat Window Top Bar */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <KoduAvatar iconSize={22} className="size-9 bg-primary/10 border-primary/20" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {preview.chatDemo.title}
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {preview.chatDemo.online}
                    </p>
                  </div>
                </div>

                <StatusBadge tone="success" className="text-xs">
                  <SparklesIcon className="size-3 text-emerald-600" />
                  IA Activa
                </StatusBadge>
              </div>

              {/* Chat Conversation Body */}
              <div className="p-6 sm:p-8 space-y-6 bg-background/50">
                {/* 1. Client Message */}
                <Message align="end">
                  <MessageContent>
                    <MessageHeader>Cliente • 10:14 AM</MessageHeader>
                    <Bubble align="end" variant="default">
                      <BubbleContent className="bg-primary text-primary-foreground font-medium">
                        {preview.chatDemo.userMsg1}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                  <MessageAvatar className="bg-muted text-muted-foreground">
                    <UserIcon className="size-4" />
                  </MessageAvatar>
                </Message>

                {/* 2. Kodu Response */}
                <Message align="start">
                  <MessageAvatar className="bg-transparent">
                    <KoduAvatar iconSize={20} className="size-8" />
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader>Kodu AI • 10:14 AM</MessageHeader>
                    <BubbleGroup>
                      <Bubble align="start" variant="muted">
                        <BubbleContent className="bg-card border border-border/80 text-foreground">
                          {preview.chatDemo.koduMsg1}
                        </BubbleContent>
                      </Bubble>
                    </BubbleGroup>
                  </MessageContent>
                </Message>

                {/* 3. Client Reply */}
                <Message align="end">
                  <MessageContent>
                    <MessageHeader>Cliente • 10:15 AM</MessageHeader>
                    <Bubble align="end" variant="default">
                      <BubbleContent className="bg-primary text-primary-foreground font-medium">
                        {preview.chatDemo.userMsg2}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                  <MessageAvatar className="bg-muted text-muted-foreground">
                    <UserIcon className="size-4" />
                  </MessageAvatar>
                </Message>

                {/* 4. Kodu Final Confirmation */}
                <Message align="start">
                  <MessageAvatar className="bg-transparent">
                    <KoduAvatar iconSize={20} className="size-8" />
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader>Kodu AI • 10:15 AM</MessageHeader>
                    <BubbleGroup>
                      <Bubble align="start" variant="muted">
                        <BubbleContent className="bg-card border border-border/80 text-foreground">
                          {preview.chatDemo.koduMsg2}
                        </BubbleContent>
                      </Bubble>

                      {/* Confirmation Ticket Card inside Bubble */}
                      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2Icon className="size-4" />
                            <span>{preview.chatDemo.statusConfirmed}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-background">
                            ID #TK-8492
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {preview.chatDemo.appointmentDetail}
                        </p>
                      </div>
                    </BubbleGroup>
                    <MessageFooter>Confirmación enviada vía WhatsApp &amp; Email</MessageFooter>
                  </MessageContent>
                </Message>
              </div>

              {/* Chat Input Placeholder Bar */}
              <div className="border-t border-border/60 bg-card p-4 flex items-center gap-3">
                <input
                  type="text"
                  disabled
                  placeholder={preview.chatDemo.typingPrompt}
                  className="flex-1 rounded-lg border border-border/70 bg-muted/40 px-4 py-2 text-xs sm:text-sm text-muted-foreground outline-none"
                />
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <SendIcon className="size-4" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Schedule Preview */}
          <TabsContent value="schedule" className="mt-0">
            <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card shadow-xl p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Left Mini Calendar */}
                <div className="md:col-span-5 flex flex-col items-center border border-border/60 rounded-xl p-4 bg-muted/20">
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <CalendarDaysIcon className="size-4 text-primary" />
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
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div>
                      <h4 className="text-base font-bold text-foreground">
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

                  <div className="space-y-3">
                    {preview.scheduleDemo.appointments.map((apt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center size-12 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            <ClockIcon className="size-3.5 mb-0.5" />
                            <span>{apt.time.split(" ")[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {apt.client}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.service} • <span className="font-medium text-foreground/70">{apt.staff}</span>
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
            <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card shadow-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {preview.analyticsDemo.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Actualizado en tiempo real por el motor de Takodu
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs gap-1">
                  <TrendingUpIcon className="size-3 text-emerald-500" />
                  Rendimiento Alto
                </Badge>
              </div>

              {/* 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border-border/70">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                      {preview.analyticsDemo.totalRevenue}
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {preview.analyticsDemo.revenueValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUpIcon className="size-3" />
                      {preview.analyticsDemo.revenueChange}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/70">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                      {preview.analyticsDemo.appointmentsCount}
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {preview.analyticsDemo.appointmentsValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {preview.analyticsDemo.appointmentsChange}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/70">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                      {preview.analyticsDemo.activeClients}
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {preview.analyticsDemo.activeClientsValue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <SparklesIcon className="size-3" />
                      {preview.analyticsDemo.activeClientsChange}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Insight Bar */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <BarChart3Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {preview.analyticsDemo.popularService}
                    </p>
                    <p className="text-sm font-bold text-foreground">
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
