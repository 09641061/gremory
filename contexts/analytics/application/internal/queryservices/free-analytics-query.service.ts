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
  type AnalyticsRankingCustomerItem,
  type AnalyticsRankingServiceItem,
  type FreeAnalyticsDashboardResponse,
} from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

type AggregatedBucket = {
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  inProgressAppointmentsCount: number;
  lastAt: string;
  establishmentId?: string;
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

    const base = await this.gateway.getFreeDashboard(accessToken);

    try {
      const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
      const establishments = workspace.establishments.map((establishment) => ({
        id: establishment.id,
      }));

      if (establishments.length === 0) {
        return {
          completedAppointmentsLastSevenDays: base.completedAppointmentsLastSevenDays,
          cancelledAppointmentsLastSevenDays: base.cancelledAppointmentsLastSevenDays,
          noShowAppointmentsLastSevenDays: base.noShowAppointmentsLastSevenDays,
          appointmentsTrend: base.appointmentsTrend,
          topCustomers: [],
          topServices: [],
        };
      }

      const { from, to } = buildUtcRange(7);
      const appointments = await loadAppointments(establishments, from, to, accessToken);
      const aggregates = aggregateAppointments(appointments);

      const topCustomers = await buildCustomerRanking(aggregates.customerBuckets, establishments);
      const topServices = await buildServiceRanking(aggregates.serviceBuckets, establishments, accessToken);

      return {
        ...base,
        topCustomers,
        topServices,
      };
    } catch (error) {
      console.error("Failed to enrich analytics snapshot:", error);
      return {
        ...base,
        topCustomers: [],
        topServices: [],
      };
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

function aggregateAppointments(appointments: ReadonlyArray<Appointment>) {
  const customerBuckets = new Map<string, AggregatedBucket>();
  const serviceBuckets = new Map<string, AggregatedBucket>();

  for (const appointment of appointments) {
    if (appointment.customerId) {
      recordBucket(customerBuckets, appointment.customerId, appointment.establishmentId ?? undefined, appointment);
    }

    if (appointment.serviceId) {
      recordBucket(serviceBuckets, appointment.serviceId, appointment.establishmentId ?? undefined, appointment);
    }
  }

  return { customerBuckets, serviceBuckets };
}

function recordBucket(
  buckets: Map<string, AggregatedBucket>,
  id: string,
  establishmentId: string | undefined,
  appointment: Appointment,
) {
  const current = buckets.get(id) ?? {
    appointmentsCount: 0,
    completedAppointmentsCount: 0,
    cancelledAppointmentsCount: 0,
    noShowAppointmentsCount: 0,
    inProgressAppointmentsCount: 0,
    lastAt: appointment.startsAt,
    establishmentId,
  };

  current.appointmentsCount += 1;
  current.completedAppointmentsCount += appointment.status === AppointmentStatus.COMPLETED ? 1 : 0;
  current.cancelledAppointmentsCount += appointment.status === AppointmentStatus.CANCELLED ? 1 : 0;
  current.noShowAppointmentsCount += appointment.status === AppointmentStatus.NO_SHOW ? 1 : 0;
  current.inProgressAppointmentsCount += appointment.status === AppointmentStatus.IN_PROGRESS ? 1 : 0;

  if (new Date(appointment.startsAt).getTime() >= new Date(current.lastAt).getTime()) {
    current.lastAt = appointment.startsAt;
    current.establishmentId = establishmentId ?? current.establishmentId;
  }

  buckets.set(id, current);
}

async function buildCustomerRanking(
  buckets: Map<string, AggregatedBucket>,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
): Promise<AnalyticsRankingCustomerItem[]> {
  const ranked = sortBuckets(buckets).slice(0, RANKING_LIMIT);
  const queryService = createCrmQueryService();

  const items = await Promise.all(
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

  return items;
}

async function buildServiceRanking(
  buckets: Map<string, AggregatedBucket>,
  establishments: ReadonlyArray<AnalyticContextEstablishment>,
  token: string,
): Promise<AnalyticsRankingServiceItem[]> {
  const ranked = sortBuckets(buckets).slice(0, RANKING_LIMIT);
  const queryService = createCatalogServiceQueryService();

  const items = await Promise.all(
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

  return items;
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

function sortBuckets(buckets: Map<string, AggregatedBucket>) {
  return [...buckets.entries()].sort((left, right) => {
    const leftBucket = left[1];
    const rightBucket = right[1];
    return (
      rightBucket.appointmentsCount - leftBucket.appointmentsCount ||
      new Date(rightBucket.lastAt).getTime() - new Date(leftBucket.lastAt).getTime()
    );
  });
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

function shortId(value: string) {
  return value.slice(0, 4);
}
