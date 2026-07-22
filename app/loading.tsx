import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background text-foreground"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">Loading</span>
    </main>
  );
}
