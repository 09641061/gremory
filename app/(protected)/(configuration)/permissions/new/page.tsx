import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default function NewRolePage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Create role</h1>
          <p className="page-description mt-2">
            Role creation is scaffolded here and can be wired to the form next.
          </p>
        </div>
        <Link
          href="/permissions"
          className={buttonVariants({ variant: "outline", className: "gap-2" })}
        >
          <ChevronLeft className="size-4" />
          Back to permissions
        </Link>
      </div>

      <Card className="rounded-xl border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Plus className="size-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">Create role form</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We can plug the shadcn form here when you want the create flow.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
