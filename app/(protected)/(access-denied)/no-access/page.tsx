import { PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default function NoAccessPage() {
  return (
    <PageShell className="min-h-svh max-w-none justify-center">
      <main className="mx-auto w-full max-w-lg">
        <Card>
          <CardContent className="space-y-4 p-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sin acceso aún
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Tu cuenta aún no tiene permisos asignados para usar los módulos de este espacio de trabajo.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Contacta a tu administrador para que te asigne un rol con permisos.
            </p>
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}