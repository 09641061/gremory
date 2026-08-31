import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createWorkforceRoleCommandService } from "@/contexts/workforce/application/internal/commandservices/workforce-role-command.service";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import { WorkforceRole } from "@/contexts/workforce/domain/model/entities/workforce-role.entity";
import {
  deleteWorkforceRoleCommand,
  assignWorkforceRoleCommand,
  createWorkforceRoleCommand,
  patchWorkforceRoleCommand,
  removeWorkforceRoleAssignmentCommand,
} from "@/contexts/workforce/domain/model/commands/workforce-role.commands";
import { workforceAssignablePermissions } from "@/contexts/workforce/domain/model/enums/workforce-permission";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";
import { requireTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import {
  workforceRoleCreateRequestSchema,
  workforceRolePatchRequestSchema,
  workforceRoleResourceSchema,
  workforceRoleResourcesSchema,
} from "../schemas/workforce-role.schemas";

const uuidSchema = z.string().uuid();

export async function listWorkforceRolesRoute() {
  try {
    const organizationId = await resolveOrganizationId();
    const roles = await createWorkforceRoleQueryService(
      await requireTeamAccessToken(),
      organizationId,
    ).list(organizationId);
    return NextResponse.json(
      workforceRoleResourcesSchema.parse(roles.map(roleToResource)),
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function listWorkforceRolePermissionsRoute() {
  return NextResponse.json(workforceAssignablePermissions);
}

export async function createWorkforceRoleRoute(request: Request) {
  try {
    const parsed = workforceRoleCreateRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const role = await createWorkforceRoleCommandService(
      await requireTeamAccessToken(),
      await resolveOrganizationId(),
    ).create(
      createWorkforceRoleCommand(parsed.data),
    );
    return NextResponse.json(
      workforceRoleResourceSchema.parse(roleToResource(role)),
      { status: 201 },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function patchWorkforceRoleRoute(
  request: Request,
  roleId: string,
) {
  try {
    const roleIdParsed = uuidSchema.safeParse(roleId);
    if (!roleIdParsed.success) {
      return validationErrorResponse(roleIdParsed.error.issues[0]?.message);
    }
    const parsed = workforceRolePatchRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const role = await createWorkforceRoleCommandService(
      await requireTeamAccessToken(),
      await resolveOrganizationId(),
    ).patch(
      patchWorkforceRoleCommand({
        roleId: roleIdParsed.data,
        ...parsed.data,
      }),
    );
    return NextResponse.json(
      workforceRoleResourceSchema.parse(roleToResource(role)),
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function deleteWorkforceRoleRoute(roleId: string) {
  try {
    const roleIdParsed = uuidSchema.safeParse(roleId);
    if (!roleIdParsed.success) {
      return validationErrorResponse(roleIdParsed.error.issues[0]?.message);
    }

    await createWorkforceRoleCommandService(
      await requireTeamAccessToken(),
      await resolveOrganizationId(),
    ).delete(
      deleteWorkforceRoleCommand({
        roleId: roleIdParsed.data,
      }),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function assignWorkforceRoleRoute(
  request: Request,
  memberId: string,
) {
  try {
    const memberIdParsed = uuidSchema.safeParse(memberId);
    if (!memberIdParsed.success) {
      return validationErrorResponse(memberIdParsed.error.issues[0]?.message);
    }
    const body = await request.json();
    const roleIdParsed = uuidSchema.safeParse((body as { roleId?: unknown })?.roleId);
    if (!roleIdParsed.success) {
      return validationErrorResponse(roleIdParsed.error.issues[0]?.message);
    }

    await createWorkforceRoleCommandService(
      await requireTeamAccessToken(),
      await resolveOrganizationId(),
    ).assign(
      assignWorkforceRoleCommand({
        memberId: memberIdParsed.data,
        roleId: roleIdParsed.data,
      }),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function removeWorkforceRoleAssignmentRoute(memberId: string, roleId: string) {
  try {
    const member = uuidSchema.safeParse(memberId);
    const role = uuidSchema.safeParse(roleId);
    if (!member.success || !role.success) return validationErrorResponse("Invalid member or role ID");
    const service = createWorkforceRoleCommandService(
      await requireTeamAccessToken(),
      await resolveOrganizationId(),
    );
    if (!service.removeAssignment) throw new Error("Role assignment removal is unavailable");
    await service.removeAssignment(
      removeWorkforceRoleAssignmentCommand({ memberId: member.data, roleId: role.data }),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

async function resolveOrganizationId(): Promise<string | undefined> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
  return workspace.organization?.id;
}

function roleToResource(role: WorkforceRole) {
  if (!role.id) {
    throw new Error("Workforce role must have an id");
  }

  return {
    id: role.id,
    name: role.getName(),
    permissions: [...role.getPermissions()],
    systemRole: role.isSystemRole(),
    position: role.position ?? 1,
  };
}

function validationErrorResponse(message?: string) {
  return NextResponse.json({ message: message ?? "Invalid request" }, { status: 400 });
}

function toRouteErrorResponse(error: unknown): Response {
  if (error instanceof TeamApiError) {
    return NextResponse.json(
      {
        message: error.message,
        details: error.details ?? null,
      },
      { status: error.status || 500 },
    );
  }

  if (error instanceof Error && error.message === "Authentication is required") {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}
