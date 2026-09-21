import type { SchedulingRosterReader } from "../../ports/scheduling-roster";
import type { SchedulingServiceViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingServices(
  reader: SchedulingRosterReader,
  establishmentId: string,
  token?: string,
): Promise<SchedulingServiceViewModel[]> {
  return reader.getSchedulingServices(establishmentId, token);
}
