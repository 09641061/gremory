import "server-only";

import type {
  SchedulingPageData,
} from "../../model/scheduling-page-data.view-model";
import { loadSchedulingCustomers } from "./scheduling-customers.query.service";
import { loadSchedulingMembers } from "./scheduling-members.query.service";
import { loadSchedulingServices } from "./scheduling-services.query.service";

export async function loadSchedulingPageData(establishmentId: string): Promise<SchedulingPageData> {
  const [services, members, customers] = await Promise.all([
    loadSchedulingServices(establishmentId),
    loadSchedulingMembers(establishmentId),
    loadSchedulingCustomers(establishmentId),
  ]);

  return { services, members, customers };
}
