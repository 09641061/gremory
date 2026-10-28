import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LockKeyhole, Plus, Shield } from "lucide-react";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { RoleRowActions } from "@/contexts/workforce/interfaces/components/role-row-actions";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";

export default function OrganizationRolesPage() { return <Suspense fallback={<PageLoading />}><RolesContent /></Suspense>; }

async function RolesContent() {
  const accessToken = await requireBusinessAccessToken();
  const workspace = await composeBusinessAdapters(accessToken).workspaceQueryService.getHeaderViewModel();
  const organization = workspace.organization;
  if (!organization || organization.id !== workspace.ownedOrganizationId) redirect("/access-denied");
  const roles = await composeWorkforceAdapters().workforceService.listRoles(accessToken, organization.id);

  return <PageShell>
    <PageHeader title="Roles y permisos" description="Crea roles a la medida de tu negocio y decide exactamente qué puede hacer cada persona." />
    <Alert><LockKeyhole /><AlertTitle>Dueño · acceso protegido</AlertTitle><AlertDescription>Tu autoridad proviene de la propiedad de la organización. No es un rol editable y siempre conserva acceso completo.</AlertDescription></Alert>
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>Roles personalizados</CardTitle><CardDescription>{roles.length} rol{roles.length === 1 ? "" : "es"} creado{roles.length === 1 ? "" : "s"} por el Dueño.</CardDescription></div><Button render={<Link href="/organization/roles/new" />}><Plus data-icon="inline-start" />Nuevo rol</Button></CardHeader>
      <CardContent>
        {roles.length === 0 ? <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><Shield /></EmptyMedia><EmptyTitle>Crea tu primer rol</EmptyTitle><EmptyDescription>Necesitas al menos un rol antes de invitar personal.</EmptyDescription></EmptyHeader><EmptyContent><Button render={<Link href="/organization/roles/new" />}><Plus data-icon="inline-start" />Crear rol</Button></EmptyContent></Empty> :
          <Table><TableHeader><TableRow><TableHead>Rol</TableHead><TableHead>Estado</TableHead><TableHead>Personas</TableHead><TableHead>Invitaciones</TableHead><TableHead>Permisos</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>
            {roles.map((role) => <TableRow key={role.id}><TableCell><div className="font-medium">{role.name}</div><div className="text-sm text-muted-foreground">{role.description || "Sin descripción"}</div></TableCell><TableCell><Badge variant={role.status === "ACTIVE" ? "secondary" : "outline"}>{role.status === "ACTIVE" ? "Activo" : "Archivado"}</Badge></TableCell><TableCell>{role.activeMemberCount}</TableCell><TableCell>{role.pendingInvitationCount}</TableCell><TableCell>{role.effectiveGrants.length === 0 ? <Badge variant="destructive">Sin acceso</Badge> : `${role.effectiveGrants.length} efectivos`}</TableCell><TableCell><RoleRowActions organizationId={organization.id} role={role} /></TableCell></TableRow>)}
          </TableBody></Table>}
      </CardContent>
    </Card>
  </PageShell>;
}
