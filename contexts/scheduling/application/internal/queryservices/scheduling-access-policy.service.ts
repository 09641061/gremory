export interface SchedulingPermissions {
  canReadAppointments: boolean;
  canCreateAppointment: boolean;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
}

export class SchedulingAccessPolicyService {
  async getPermissions(establishmentId?: string): Promise<SchedulingPermissions> {
    const enabled = Boolean(establishmentId);

    return {
      canReadAppointments: enabled,
      canCreateAppointment: false,
      canUpdateAppointment: false,
      canDeleteAppointment: false,
    };
  }
}

export function createSchedulingAccessPolicyService() {
  return new SchedulingAccessPolicyService();
}
