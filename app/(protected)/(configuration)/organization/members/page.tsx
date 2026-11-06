import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";
import { MemberRowActions } from "@/contexts/workforce/interfaces/components/member-row-actions";
import { RoleAssignmentSelect } from "@/contexts/workforce/interfaces/components/role-assignment-select";

export default function OrganizationMembersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrganizationMembersPageContent />
    </Suspense>
  );
}

async function OrganizationMembersPageContent() {
  const dictionary = await getServerDictionary();
  const accessToken = await requireBusinessAccessToken();
  const workspace = await composeBusinessAdapters(accessToken).workspaceQueryService.getHeaderViewModel();
  const organization = workspace.organization;
  if (!organization || organization.id !== workspace.ownedOrganizationId) redirect("/access-denied");
  const workforce = composeWorkforceAdapters().workforceService;
  const [members, roles] = await Promise.all([
    workforce.listMembers(accessToken, organization.id),
    workforce.listRoles(accessToken, organization.id),
  ]);
  const activeRoles = roles.filter((role) => role.status === "ACTIVE");
  const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });

  return (
    <PageShell>
      <PageHeader title={dictionary.organizationSettings.members} description="Personas que ya aceptaron una invitación y colaboran en tu organización." />
      <Card>
        <CardHeader><CardTitle>Colaboradores</CardTitle><CardDescription>{members.length} persona{members.length === 1 ? "" : "s"} registrada{members.length === 1 ? "" : "s"}.</CardDescription></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>Aún no hay colaboradores</EmptyTitle><EmptyDescription>Las personas aparecerán aquí después de aceptar su invitación.</EmptyDescription></EmptyHeader></Empty>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Correo</TableHead><TableHead>Establecimiento</TableHead><TableHead>Rol</TableHead><TableHead>Se unió</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{members.map((member) => <TableRow key={member.id}><TableCell className="font-medium">{member.email}</TableCell><TableCell>{member.establishmentName}</TableCell><TableCell><RoleAssignmentSelect organizationId={organization.id} targetId={member.id} target="member" currentRoleId={member.role?.id ?? null} roles={activeRoles} /></TableCell><TableCell>{dateFormatter.format(new Date(member.joinedAt))}</TableCell><TableCell className="text-right"><MemberRowActions organizationId={organization.id} membershipId={member.id} email={member.email} /></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
