import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 text-foreground">
      <section className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          You do not have permission to access this section
        </h1>
        <p className="text-muted-foreground">
          Your user belongs to an organization and establishment, but your role does not have permission to use this module.
        </p>
        <p className="text-muted-foreground">
          Ask the organization administrator to assign you the required permissions.
        </p>
        <Link className="text-primary underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
