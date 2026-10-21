import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MailPlus } from "lucide-react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { getServerDictionary } from "@/contexts/shared/infrastructure/i18n/server";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { InviteCollaboratorForm } from "@/contexts/workforce/interfaces/components/invite-collaborator-form";
import { InvitationRowActions } from "@/contexts/workforce/interfaces/components/invitation-row-actions";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";

export default function OrganizationInvitesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrganizationInvitesPageContent />
    </Suspense>
  );
}

async function OrganizationInvitesPageContent() {
  const dictionary = await getServerDictionary();
  const accessToken = await requireBusinessAccessToken();
  const business = composeBusinessAdapters(accessToken);
  const workspace = await business.workspaceQueryService.getHeaderViewModel();
  const organization = workspace.organization;
  if (!organization || organization.id !== workspace.ownedOrganizationId) redirect("/access-denied");

  const [invitations, establishmentsPage] = await Promise.all([
    composeWorkforceAdapters().workforceService.listInvitations(accessToken, organization.id),
    business.establishmentQueryService.getByOrganization({ organizationId: organization.id, page: 0, size: 100 }),
  ]);
  const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

  return (
    <PageShell>
      <PageHeader title={dictionary.organizationSettings.invites} description="Envía un enlace por correo electrónico para sumar colaboradores a tu organización." />
      <Card>
        <CardHeader>
          <CardTitle>Nueva invitación</CardTitle>
          <CardDescription>La invitación expirará automáticamente y podrá revocarse antes de ser aceptada.</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteCollaboratorForm organizationId={organization.id} establishments={establishmentsPage.content.map(({ id, name }) => ({ id, name }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invitaciones pendientes</CardTitle><CardDescription>{invitations.length} invitación{invitations.length === 1 ? "" : "es"} activa{invitations.length === 1 ? "" : "s"}.</CardDescription></CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><MailPlus /></EmptyMedia><EmptyTitle>Aún no hay invitaciones pendientes</EmptyTitle><EmptyDescription>Usa el formulario para enviar la primera.</EmptyDescription></EmptyHeader></Empty>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Correo</TableHead><TableHead>Establecimiento</TableHead><TableHead>Estado</TableHead><TableHead>Expira</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>{invitation.establishmentName}</TableCell>
                  <TableCell><Badge variant="secondary">Pendiente</Badge></TableCell>
                  <TableCell>{dateFormatter.format(new Date(invitation.expiresAt))}</TableCell>
                  <TableCell><InvitationRowActions organizationId={organization.id} invitationId={invitation.id} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
