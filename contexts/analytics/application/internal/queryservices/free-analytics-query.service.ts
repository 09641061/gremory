import "server-only";

import { cookies } from "next/headers";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createCrmQueryService } from "@/contexts/crm/application/internal/queryservices/crm-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createSchedulingQueryService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-query.service.impl";
import type { Appointment } from "@/contexts/scheduling/domain/model/entities/appointment";
import { AppointmentStatus } from "@/contexts/scheduling/domain/model/valueobjects/appointment-status";
import {
  AnalyticsApiGateway,
  type AnalyticsCategoryPoint,
  type AnalyticsDualTrendPoint,
  type AnalyticsRankingCustomerItem,
  type AnalyticsRankingServiceItem,
  type AnalyticsServiceRateItem,
  type AnalyticsTrendPoint,
  type AnalyticsCustomerMix,
  type FreeAnalyticsDashboardResponse,
} from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

type CustomerBucket = {
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  lastAt: string;
};

type ServiceBucket = {
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  lastAt: string;
};

type DayBucket = {
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  leadTimeTotalMinutes: number;
  leadTimeSamples: number;
};

type AggregatedData = {
  customerBuckets: Map<string, CustomerBucket>;
  serviceBuckets: Map<string, ServiceBucket>;
  dayBuckets: Map<string, DayBucket>;
  weekdayCounts: number[];
  hourCounts: number[];
  customerVisits: Map<string, number>;
};

type AnalyticContextEstablishment = {
  id: string;
};

const RANKING_LIMIT = 5;
const PAGE_SIZE = 200;

export class FreeAnalyticsQueryService {
  constructor(private readonly gateway = new AnalyticsApiGateway()) {}

  async handle(): Promise<FreeAnalyticsDashboardResponse> {
    const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      const error = new Error("Authentication required");
      (error as Error & { status?: number }).status = 401;
      throw error;
    }

    await this.gateway.getFreeDashboard(accessToken);

    try {
      const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
      const establishments = workspace.establishments.map((establishment) => ({
        id: establishment.id,
      }));

      if (establishments.length === 0) {
        return emptySnapshot();
      }

      const { from, to } = buildUtcRange(7);
      const appointments = await loadAppointments(establishments, from, to, accessToken);
      const aggregates = aggregateAppointments(appointments);

      const appointmentsTrend = buildDateTrend(aggregates.dayBuckets, from, to, (bucket) => bucket.appointmentsCount);
      const completionVsCancellationTrend = buildCompletionVsCancellationTrend(aggregates.dayBuckets, from, to);
      const leadTimeTrend = buildDateTrend(aggregates.dayBuckets, from, to, (bucket) =>
        bucket.leadTimeSamples > 0 ? bucket.leadTimeTotalMinutes / bucket.leadTimeSamples / 60 : 0,
      );

      const topCustomers = await buildCustomerRanking(aggregates.customerBuckets, establishments);
      const topServices = await buildServiceRanking(aggregates.serviceBuckets, establishments, accessToken);
      const cancellationRateByService = await buildServiceRateRanking(
        aggregates.serviceBuckets,
        establishments,
        accessToken,
        "cancelled",
      );
      const noShowRateByService = await buildServiceRateRanking(
        aggregates.serviceBuckets,
        establishments,
        accessToken,
        "noShow",
      );

      return {
        completedAppointmentsLastSevenDays: countStatus(appointments, AppointmentStatus.COMPLETED),
        cancelledAppointmentsLastSevenDays: countStatus(appointments, AppointmentStatus.CANCELLED),
        noShowAppointmentsLastSevenDays: countStatus(appointments, AppointmentStatus.NO_SHOW),
        appointmentsTrend,
        appointmentsByWeekday: buildWeekdaySeries(aggregates.weekdayCounts),
        appointmentsByHour: buildHourSeries(aggregates.hourCounts),
        completionVsCancellationTrend,
        leadTimeTrend,
        newVsRecurringCustomers: buildCustomerMix(aggregates.customerVisits),
        topCustomers,
        topServices,
        cancellationRateByService,
        noShowRateByService,
      };
    } catch (error) {
      console.error("Failed to enrich analytics snapshot:", error);
      return emptySnapshot();
    }
  }
}

export function createFreeAnalyticsQueryService() {
  return new FreeAnalyticsQueryService();
}

async function loadAppointments(
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
  from: string,
  to: string,
  token: string,
): Promise<Appointment[]> {
  const queryService = createSchedulingQueryService();

  const batches = await Promise.allSettled(
    establishments.map(async (establishment) => {
      const pages: Appointment[] = [];
      let page = 0;

      while (true) {
        const response = await queryService.searchAppointments(
          {
            from,
            to,
            establishmentId: establishment.id,
            page,
            size: PAGE_SIZE,
          },
          token,
        );

        pages.push(...response.content);
        if (response.last || page >= Math.max(response.totalPages - 1, 0)) break;
        page += 1;
      }

      return pages;
    }),
  );

  const appointments: Appointment[] = [];
  for (const result of batches) {
    if (result.status === "fulfilled") {
      appointments.push(...result.value);
    }
  }

  return appointments;
}

function aggregateAppointments(appointments: ReadonlyArray<Appointment>): AggregatedData {
  const customerBuckets = new Map<string, CustomerBucket>();
  const serviceBuckets = new Map<string, ServiceBucket>();
  const dayBuckets = new Map<string, DayBucket>();
  const weekdayCounts = Array.from({ length: 7 }, () => 0);
  const hourCounts = Array.from({ length: 24 }, () => 0);
  const customerVisits = new Map<string, number>();

  for (const appointment of appointments) {
    const startsAt = toUtcDate(appointment.startsAt);
    if (!startsAt) continue;

    const dateKey = formatDateKey(startsAt);
    const dayBucket = dayBuckets.get(dateKey) ?? {
      appointmentsCount: 0,
      completedAppointmentsCount: 0,
      cancelledAppointmentsCount: 0,
      leadTimeTotalMinutes: 0,
      leadTimeSamples: 0,
    };

    dayBucket.appointmentsCount += 1;
    if (appointment.status === AppointmentStatus.COMPLETED) dayBucket.completedAppointmentsCount += 1;
    if (appointment.status === AppointmentStatus.CANCELLED) dayBucket.cancelledAppointmentsCount += 1;

    const createdAt = toUtcDate(appointment.createdAt);
    if (createdAt) {
      const leadTimeMinutes = Math.max(0, (startsAt.getTime() - createdAt.getTime()) / 60000);
      dayBucket.leadTimeTotalMinutes += leadTimeMinutes;
      dayBucket.leadTimeSamples += 1;
    }

    dayBuckets.set(dateKey, dayBucket);

    const weekday = startsAt.getUTCDay();
    weekdayCounts[weekday] += 1;

    const hour = startsAt.getUTCHours();
    hourCounts[hour] += 1;

    if (appointment.customerId) {
      customerVisits.set(appointment.customerId, (customerVisits.get(appointment.customerId) ?? 0) + 1);
      recordCustomerBucket(customerBuckets, appointment.customerId, appointment);
    }

    if (appointment.serviceId) {
      recordServiceBucket(serviceBuckets, appointment.serviceId, appointment);
    }
  }

  return { customerBuckets, serviceBuckets, dayBuckets, weekdayCounts, hourCounts, customerVisits };
}

function recordCustomerBucket(
  buckets: Map<string, CustomerBucket>,
  id: string,
  appointment: Appointment,
) {
  const current = buckets.get(id) ?? {
    appointmentsCount: 0,
    completedAppointmentsCount: 0,
    cancelledAppointmentsCount: 0,
    noShowAppointmentsCount: 0,
    lastAt: appointment.startsAt,
  };

  current.appointmentsCount += 1;
  current.completedAppointmentsCount += appointment.status === AppointmentStatus.COMPLETED ? 1 : 0;
  current.cancelledAppointmentsCount += appointment.status === AppointmentStatus.CANCELLED ? 1 : 0;
  current.noShowAppointmentsCount += appointment.status === AppointmentStatus.NO_SHOW ? 1 : 0;
  if (new Date(appointment.startsAt).getTime() >= new Date(current.lastAt).getTime()) {
    current.lastAt = appointment.startsAt;
  }

  buckets.set(id, current);
}

function recordServiceBucket(
  buckets: Map<string, ServiceBucket>,
  id: string,
  appointment: Appointment,
) {
  const current = buckets.get(id) ?? {
    appointmentsCount: 0,
    completedAppointmentsCount: 0,
    cancelledAppointmentsCount: 0,
    noShowAppointmentsCount: 0,
    lastAt: appointment.startsAt,
  };

  current.appointmentsCount += 1;
  current.completedAppointmentsCount += appointment.status === AppointmentStatus.COMPLETED ? 1 : 0;
  current.cancelledAppointmentsCount += appointment.status === AppointmentStatus.CANCELLED ? 1 : 0;
  current.noShowAppointmentsCount += appointment.status === AppointmentStatus.NO_SHOW ? 1 : 0;

  if (new Date(appointment.startsAt).getTime() >= new Date(current.lastAt).getTime()) {
    current.lastAt = appointment.startsAt;
  }

  buckets.set(id, current);
}

async function buildCustomerRanking(
  buckets: Map<string, CustomerBucket>,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
): Promise<AnalyticsRankingCustomerItem[]> {
  const ranked = sortCustomerBuckets(buckets).slice(0, RANKING_LIMIT);
  const queryService = createCrmQueryService();

  return Promise.all(
    ranked.map(async ([customerId, bucket], index) => {
      const customer = await resolveCustomerName(queryService, customerId, establishments);

      return {
        rank: index + 1,
        customerId,
        customerName: customer?.name ?? `Customer ${shortId(customerId)}`,
        appointmentsCount: bucket.appointmentsCount,
        completedAppointmentsCount: bucket.completedAppointmentsCount,
        cancelledAppointmentsCount: bucket.cancelledAppointmentsCount,
        noShowAppointmentsCount: bucket.noShowAppointmentsCount,
        lastAppointmentAt: bucket.lastAt,
      };
    }),
  );
}

async function buildServiceRanking(
  buckets: Map<string, ServiceBucket>,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
  token: string,
): Promise<AnalyticsRankingServiceItem[]> {
  const ranked = sortServiceBuckets(buckets).slice(0, RANKING_LIMIT);
  const queryService = createCatalogServiceQueryService();

  return Promise.all(
    ranked.map(async ([serviceId, bucket], index) => {
      const service = await resolveServiceName(queryService, serviceId, establishments, token);

      return {
        rank: index + 1,
        serviceId,
        serviceName: service?.name ?? `Service ${shortId(serviceId)}`,
        appointmentsCount: bucket.appointmentsCount,
        completedAppointmentsCount: bucket.completedAppointmentsCount,
        cancelledAppointmentsCount: bucket.cancelledAppointmentsCount,
        noShowAppointmentsCount: bucket.noShowAppointmentsCount,
        lastBookedAt: bucket.lastAt,
      };
    }),
  );
}

async function buildServiceRateRanking(
  buckets: Map<string, ServiceBucket>,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
  token: string,
  kind: "cancelled" | "noShow",
): Promise<AnalyticsServiceRateItem[]> {
  const ranked = sortServiceRateBuckets(buckets, kind).slice(0, RANKING_LIMIT);
  const queryService = createCatalogServiceQueryService();

  return Promise.all(
    ranked.map(async ([serviceId, bucket], index) => {
      const service = await resolveServiceName(queryService, serviceId, establishments, token);
      const affectedCount = kind === "cancelled" ? bucket.cancelledAppointmentsCount : bucket.noShowAppointmentsCount;
      const rate = bucket.appointmentsCount > 0 ? affectedCount / bucket.appointmentsCount : 0;

      return {
        rank: index + 1,
        serviceId,
        serviceName: service?.name ?? `Service ${shortId(serviceId)}`,
        appointmentsCount: bucket.appointmentsCount,
        affectedCount,
        rate: roundRate(rate),
        lastAppointmentAt: bucket.lastAt,
      };
    }),
  );
}

async function resolveCustomerName(
  queryService: ReturnType<typeof createCrmQueryService>,
  customerId: string,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
) {
  for (const establishment of establishments) {
    const customer = await queryService.getCustomer(customerId, establishment.id).catch(() => null);
    if (customer) return customer;
  }

  return null;
}

async function resolveServiceName(
  queryService: ReturnType<typeof createCatalogServiceQueryService>,
  serviceId: string,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
  token: string,
) {
  for (const establishment of establishments) {
    const service = await queryService.getById(serviceId, establishment.id, token).catch(() => null);
    if (service) return service;
  }

  return null;
}

function sortCustomerBuckets(buckets: Map<string, CustomerBucket>) {
  return [...buckets.entries()].sort((left, right) => {
    const leftBucket = left[1];
    const rightBucket = right[1];
    return (
      rightBucket.appointmentsCount - leftBucket.appointmentsCount ||
      new Date(rightBucket.lastAt).getTime() - new Date(leftBucket.lastAt).getTime()
    );
  });
}

function sortServiceBuckets(buckets: Map<string, ServiceBucket>) {
  return [...buckets.entries()].sort((left, right) => {
    const leftBucket = left[1];
    const rightBucket = right[1];
    return (
      rightBucket.appointmentsCount - leftBucket.appointmentsCount ||
      new Date(rightBucket.lastAt).getTime() - new Date(leftBucket.lastAt).getTime()
    );
  });
}

function sortServiceRateBuckets(buckets: Map<string, ServiceBucket>, kind: "cancelled" | "noShow") {
  return [...buckets.entries()].sort((left, right) => {
    const leftBucket = left[1];
    const rightBucket = right[1];
    const leftAffected = kind === "cancelled" ? leftBucket.cancelledAppointmentsCount : leftBucket.noShowAppointmentsCount;
    const rightAffected = kind === "cancelled" ? rightBucket.cancelledAppointmentsCount : rightBucket.noShowAppointmentsCount;
    const leftRate = leftBucket.appointmentsCount > 0 ? leftAffected / leftBucket.appointmentsCount : 0;
    const rightRate = rightBucket.appointmentsCount > 0 ? rightAffected / rightBucket.appointmentsCount : 0;

    return rightRate - leftRate || rightAffected - leftAffected || rightBucket.appointmentsCount - leftBucket.appointmentsCount;
  });
}

function buildDateTrend<T>(
  buckets: Map<string, T>,
  from: string,
  to: string,
  selector: (bucket: T) => number,
): AnalyticsTrendPoint[] {
  const days = buildDateRange(from, to);
  return days.map((date) => ({
    date,
    value: buckets.has(date) ? selector(buckets.get(date) as T) : 0,
  }));
}

function buildCompletionVsCancellationTrend(
  buckets: Map<string, DayBucket>,
  from: string,
  to: string,
): AnalyticsDualTrendPoint[] {
  const days = buildDateRange(from, to);
  return days.map((date) => {
    const bucket = buckets.get(date);
    return {
      date,
      completed: bucket?.completedAppointmentsCount ?? 0,
      cancelled: bucket?.cancelledAppointmentsCount ?? 0,
    };
  });
}

function buildWeekdaySeries(counts: number[]): AnalyticsCategoryPoint[] {
  const order = [
    { label: "Mon", index: 1 },
    { label: "Tue", index: 2 },
    { label: "Wed", index: 3 },
    { label: "Thu", index: 4 },
    { label: "Fri", index: 5 },
    { label: "Sat", index: 6 },
    { label: "Sun", index: 0 },
  ];

  return order.map(({ label, index }) => ({
    label,
    value: counts[index] ?? 0,
  }));
}

function buildHourSeries(counts: number[]): AnalyticsCategoryPoint[] {
  return counts.map((value, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value,
  }));
}

function buildCustomerMix(customerVisits: Map<string, number>): AnalyticsCustomerMix {
  const totalCustomers = customerVisits.size;
  let newCustomers = 0;

  for (const visits of customerVisits.values()) {
    if (visits === 1) newCustomers += 1;
  }

  return {
    newCustomers,
    recurrentCustomers: Math.max(0, totalCustomers - newCustomers),
    totalCustomers,
  };
}

function countStatus(appointments: ReadonlyArray<Appointment>, status: typeof AppointmentStatus[keyof typeof AppointmentStatus]) {
  return appointments.reduce((total, appointment) => total + (appointment.status === status ? 1 : 0), 0);
}

function buildUtcRange(days: number) {
  const now = new Date();
  const to = new Date(now);
  to.setUTCHours(23, 59, 59, 999);

  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  from.setUTCHours(0, 0, 0, 0);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function buildDateRange(from: string, to: string) {
  const start = toUtcDate(from);
  const end = toUtcDate(to);
  if (!start || !end) return [];

  const days: string[] = [];
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    days.push(formatDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function toUtcDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundRate(value: number) {
  return Math.round(value * 1000) / 1000;
}

function shortId(value: string) {
  return value.slice(0, 4);
}

function emptySnapshot(): FreeAnalyticsDashboardResponse {
  return {
    completedAppointmentsLastSevenDays: 0,
    cancelledAppointmentsLastSevenDays: 0,
    noShowAppointmentsLastSevenDays: 0,
    appointmentsTrend: [],
    appointmentsByWeekday: buildWeekdaySeries(Array.from({ length: 7 }, () => 0)),
    appointmentsByHour: buildHourSeries(Array.from({ length: 24 }, () => 0)),
    completionVsCancellationTrend: [],
    leadTimeTrend: [],
    newVsRecurringCustomers: {
      newCustomers: 0,
      recurrentCustomers: 0,
      totalCustomers: 0,
    },
    topCustomers: [],
    topServices: [],
    cancellationRateByService: [],
    noShowRateByService: [],
  };
}
