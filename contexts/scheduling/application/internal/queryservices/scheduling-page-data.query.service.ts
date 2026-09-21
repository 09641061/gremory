import type { SchedulingRosterReader } from "../../ports/scheduling-roster";
import type { SchedulingPageData } from "../../model/scheduling-page-data.view-model";
import { loadSchedulingCustomers } from "./scheduling-customers.query.service";
import { loadSchedulingMembers } from "./scheduling-members.query.service";
import { loadSchedulingServices } from "./scheduling-services.query.service";

export async function loadSchedulingPageData(
  reader: SchedulingRosterReader,
  establishmentId: string,
  token: string | undefined,
  canManageScheduling: boolean,
): Promise<SchedulingPageData> {
  const [services, members, customers] = await Promise.all([
    canManageScheduling
      ? loadSchedulingServices(reader, establishmentId, token)
      : Promise.resolve([]),
    loadSchedulingMembers(reader, establishmentId, token),
    canManageScheduling
      ? loadSchedulingCustomers(reader, establishmentId, token)
      : Promise.resolve([]),
  ]);

  return { services, members, customers };
}
