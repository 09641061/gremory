import type { SchedulingRosterReader } from "../../ports/scheduling-roster";
import type { SchedulingServiceViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingServices(
  reader: SchedulingRosterReader,
  establishmentId: string,
  token?: string,
): Promise<SchedulingServiceViewModel[]> {
  const services = await reader.getSchedulingServices(establishmentId, token);
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    price: service.price,
    durationMinutes: service.durationMinutes,
    preparationMinutes: service.preparationMinutes ?? 0,
    cleanupMinutes: service.cleanupMinutes ?? 0,
  }));
}
