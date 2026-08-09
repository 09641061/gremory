import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-foreground">
      <section className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Access pending</h1>
        <p className="text-muted-foreground">
          You are already a member of an organization and establishment, but no application module has been assigned to your role yet.
        </p>
        <p className="text-muted-foreground">
          Ask the organization administrator to assign the required permissions.
        </p>
        <Link className="text-primary underline underline-offset-4" href="/login">
          Sign in with another account
        </Link>
      </section>
    </main>
  );
}
