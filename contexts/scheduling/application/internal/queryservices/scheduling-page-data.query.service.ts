import "server-only";

import type {
  SchedulingPageData,
} from "../../model/scheduling-page-data.view-model";
import { loadSchedulingCustomers } from "./scheduling-customers.query.service";
import { loadSchedulingMembers } from "./scheduling-members.query.service";
import { loadSchedulingServices } from "./scheduling-services.query.service";

export async function loadSchedulingPageData(establishmentId: string): Promise<SchedulingPageData> {
  const services = await loadSchedulingServices(establishmentId);
  const members = await loadSchedulingMembers(establishmentId);
  const customers = await loadSchedulingCustomers(establishmentId);

  return { services, members, customers };
}
