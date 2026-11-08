import type { SchedulingRosterWriter } from "../../ports/scheduling-roster";

export class SchedulingRosterCommandService {
  constructor(private readonly writer: SchedulingRosterWriter) {}

  updateEmployeeVisibility(
    userId: string,
    establishmentId: string,
    visible: boolean,
    token?: string,
  ): Promise<void> {
    return this.writer.updateEmployeeVisibility(userId, establishmentId, visible, token);
  }

  updateEmployeeAvailability(
    userId: string,
    establishmentId: string,
    available: boolean,
    token?: string,
  ): Promise<void> {
    return this.writer.updateEmployeeAvailability(userId, establishmentId, available, token);
  }
}
