import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  acceptTeamInvitationCommand,
  inviteTeamUserCommand,
  removeTeamMemberCommand,
  revokeTeamInvitationCommand,
} from "@/contexts/workforce/domain/model/commands/team.commands";
import { workforceUserStatuses } from "@/contexts/workforce/domain/model/enums/workforce-user-status";
import { listTeamUsersQuery, previewTeamInvitationQuery } from "@/contexts/workforce/domain/model/queries/team.queries";
import { createTeamCommandService } from "@/contexts/workforce/application/internal/commandservices/team-command.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import {
  inviteTeamUserSchema,
  invitationTokenSchema,
} from "../schemas/team.schemas";
import { getTeamAccessToken, requireTeamAccessToken } from "@/contexts/workforce/infrastructure/session/team-session";
import { TeamApiError } from "@/contexts/workforce/infrastructure/gateways/team-api.gateway";

const uuidSchema = z.string().uuid();
const listMembersQuerySchema = z.object({
  establishmentId: uuidSchema.optional(),
  status: z.enum(workforceUserStatuses).optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listWorkforceMembersRoute(request: Request) {
  try {
    const token = await requireTeamAccessToken();
    const query = parseListMembersQuery(request);
    if ("error" in query) return query.error;

    const result = await createTeamQueryService(token).list(
      listTeamUsersQuery(query.value),
    );
    return NextResponse.json(result);
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function createWorkforceInvitationRoute(request: Request) {
  try {
    const token = await requireTeamAccessToken();
    const body = await parseJsonBody(request);
    const parsed = inviteTeamUserSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const invitationId = await createTeamCommandService(token).invite(
      inviteTeamUserCommand(parsed.data),
    );
    return NextResponse.json({ id: invitationId.value }, { status: 201 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function revokeWorkforceInvitationRoute(invitationId: string) {
  try {
    const token = await requireTeamAccessToken();
    const parsed = uuidSchema.safeParse(invitationId);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    await createTeamCommandService(token).revokeInvitation(
      revokeTeamInvitationCommand({ invitationId: parsed.data }),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function removeWorkforceMemberRoute(memberId: string) {
  try {
    const token = await requireTeamAccessToken();
    const parsed = uuidSchema.safeParse(memberId);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    await createTeamCommandService(token).removeMember(
      removeTeamMemberCommand({ memberId: parsed.data }),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function previewWorkforceInvitationRoute(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const parsed = invitationTokenSchema.safeParse(query.get("token"));
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const token = await getTeamAccessToken();
    const preview = await createTeamQueryService(token).previewInvitation(
      previewTeamInvitationQuery({ token: parsed.data }),
    );
    return NextResponse.json(preview);
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function acceptWorkforceInvitationRoute(request: Request) {
  try {
    const token = await requireTeamAccessToken();
    const body = await parseJsonBody(request);
    const parsed = invitationTokenSchema.safeParse(
      (body as { token?: unknown } | undefined)?.token,
    );
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const memberId = await createTeamCommandService(token).acceptInvitation(
      acceptTeamInvitationCommand({ token: parsed.data }),
    );
    return NextResponse.json({ memberId: memberId.value });
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

export async function workforceAccessRoute() {
  try {
    const token = await requireTeamAccessToken();
    const access = await createTeamQueryService(token).getAccessContext();
    return NextResponse.json(access);
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

function parseListMembersQuery(request: Request):
  | { value: z.infer<typeof listMembersQuerySchema> }
  | { error: Response } {
  const url = new URL(request.url);
  const parsed = listMembersQuerySchema.safeParse({
    establishmentId: url.searchParams.get("establishmentId") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
  });

  if (!parsed.success) {
    return { error: validationErrorResponse(parsed.error.issues[0]?.message) };
  }

  return { value: parsed.data };
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function validationErrorResponse(message?: string) {
  return NextResponse.json(
    { message: message ?? "Invalid request" },
    { status: 400 },
  );
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
    return NextResponse.json(
      { message: error.message },
      { status: 401 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { message: "Unexpected error" },
    { status: 500 },
  );
}
