import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function PageLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
