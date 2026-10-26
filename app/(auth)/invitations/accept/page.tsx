import { cookies } from "next/headers";
import Link from "next/link";
import { Building2, Clock3, MailOpen } from "lucide-react";

import {
  loginPath,
  registrationPath,
} from "@/contexts/iam/domain/model/valueobjects/auth-return-path";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { AcceptInvitationButton } from "@/contexts/workforce/interfaces/components/accept-invitation-button";
import { composeWorkforceAdapters } from "@/contexts/workforce/interfaces/server/workforce-composition";
import { invitationTokenSchema } from "@/contexts/workforce/interfaces/rest/workforce.schemas";

type PageProps = { searchParams: Promise<{ token?: string | string[] }> };

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const raw = (await searchParams).token;
  const parsed = invitationTokenSchema.safeParse(Array.isArray(raw) ? raw[0] : raw);
  const token = parsed.success ? parsed.data : null;
  const preview = token ? await composeWorkforceAdapters().workforceService.preview(token).catch(() => null) : null;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const returnPath = token ? `/invitations/accept?token=${encodeURIComponent(token)}` : "/invitations/accept";

  return (
    <PageShell className="min-h-svh max-w-none items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b bg-muted/20">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><MailOpen className="size-6" /></div>
          <CardTitle className="text-xl">Invitación para colaborar</CardTitle>
          <CardDescription>{preview ? `Te invitaron a colaborar en ${preview.organizationName}.` : "Este enlace no es válido o ya expiró."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {preview ? (
            <>
              <dl className="grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2">
                <div><dt className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-4" />Establecimiento</dt><dd className="mt-1 font-medium">{preview.establishmentName}</dd></div>
                <div><dt className="flex items-center gap-2 text-muted-foreground"><Clock3 className="size-4" />Válida hasta</dt><dd className="mt-1 font-medium">{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(preview.expiresAt))}</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground">
                Esta invitación está dirigida a <span className="font-medium text-foreground">{preview.maskedEmail}</span>.
                {preview.recipientRegistered
                  ? " Debes iniciar sesión con ese correo."
                  : " Crea una cuenta con ese correo para poder aceptarla."}
              </p>
              {accessToken ? (
                <AcceptInvitationButton token={token!} />
              ) : preview.recipientRegistered ? (
                <Button className="w-full" render={<Link href={loginPath(returnPath)} />}>
                  Iniciar sesión para aceptar
                </Button>
              ) : (
                <Button className="w-full" render={<Link href={registrationPath(returnPath)} />}>
                  Crear cuenta para aceptar
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" className="w-full" render={<Link href="/login" />}>Ir al inicio de sesión</Button>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
