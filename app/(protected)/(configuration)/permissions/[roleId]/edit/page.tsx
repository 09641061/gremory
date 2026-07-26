import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { createWorkforceRoleQueryService } from "@/contexts/workforce/application/internal/queryservices/workforce-role-query.service";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  const role = (await createWorkforceRoleQueryService().list()).find(
    (item) => item.id === roleId,
  );

  if (!role) notFound();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Edit role</h1>
          <p className="page-description mt-2">
            {role.getName()} is loaded here and can be wired to the edit form next.
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
            <Pencil className="size-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{role.getName()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {role.getPermissions().length}{" "}
              {role.getPermissions().length === 1 ? "permission" : "permissions"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {role.getPermissions().map((permission) => (
              <span
                key={permission}
                className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {permission}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
