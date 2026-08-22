import "server-only";

import type {
  SchedulingPageData,
} from "../../model/scheduling-page-data.view-model";
import { loadSchedulingCustomers } from "./scheduling-customers.query.service";
import { loadSchedulingMembers } from "./scheduling-members.query.service";
import { loadSchedulingServices } from "./scheduling-services.query.service";

export async function loadSchedulingPageData(
  establishmentId: string,
  organizationId: string,
  canManageScheduling: boolean,
): Promise<SchedulingPageData> {
  const [services, members, customers] = await Promise.all([
    canManageScheduling
      ? loadSchedulingServices(establishmentId, organizationId)
      : Promise.resolve([]),
    loadSchedulingMembers(establishmentId, organizationId).catch((error) => {
      console.error("Failed to load scheduling members:", error);
      return [];
    }),
    canManageScheduling
      ? loadSchedulingCustomers(establishmentId, organizationId)
      : Promise.resolve([]),
  ]);

  return { services, members, customers };
}
