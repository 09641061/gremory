import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

export function PageLoading() {
  return (
    <div
      className="flex min-h-[60svh] w-full flex-1 items-center justify-center"
      aria-live="polite"
    >
      <Spinner className="size-8" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
