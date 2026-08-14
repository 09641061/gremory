import "server-only";

import { apiConfig } from "@/api.config";
import { z } from "zod";
import { teamGet } from "../http/team-api.client";

const workforceEntryAccessResourceSchema = z.object({
  active: z.boolean().optional(),
  capabilities: z.object({
    canReadTeam: z.boolean().optional(),
    canReadAppointments: z.boolean().optional(),
    canCreateAppointment: z.boolean().optional(),
    canUpdateAppointment: z.boolean().optional(),
    canDeleteAppointment: z.boolean().optional(),
    canReadAnalytics: z.boolean().optional(),
  }).optional(),
  establishments: z.array(z.object({
    organizationId: z.string(),
    organizationName: z.string(),
    establishmentId: z.string(),
    establishmentName: z.string(),
    roles: z.array(z.object({ name: z.string() }).passthrough()).optional(),
    effectivePermissions: z.array(z.string()).optional(),
  })),
});

export class WorkforceAccessGateway {
  constructor(private readonly providedToken?: string) {}

  async getAccessContext() {
    const resource = await teamGet<unknown>(apiConfig.routes.workforce.access, this.providedToken);
    return workforceEntryAccessResourceSchema.parse(resource);
  }
}

