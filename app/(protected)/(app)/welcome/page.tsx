export default function WelcomePage() {
  return (
    <section className="flex min-h-[60svh] flex-1 items-center justify-center px-6 text-foreground">
      <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card px-8 py-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Takodu
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Bienvenido
        </h1>
        <p className="max-w-prose text-base leading-7 text-muted-foreground">
          Tu espacio ya está listo. Desde aquí puedes empezar a usar la app y explorar
          las secciones disponibles en el sidebar.
        </p>
      </div>
    </section>
  );
}
