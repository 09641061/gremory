import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 text-foreground">
      <section className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          No tienes permisos para acceder a esta sección
        </h1>
        <p className="text-muted-foreground">
          Tu usuario pertenece a una organización y establecimiento, pero tu rol no tiene permisos para utilizar este módulo.
        </p>
        <p className="text-muted-foreground">
          Solicita al administrador de la organización que te asigne los permisos necesarios.
        </p>
        <Link className="text-primary underline underline-offset-4" href="/login">
          Volver a iniciar sesión
        </Link>
      </section>
    </main>
  );
}
