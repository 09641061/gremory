"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save } from "lucide-react";
type OrganizationDetails = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
}>;
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
import { Card, CardContent, CardFooter } from "@/contexts/shared/interfaces/components/ui/card";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

interface OrganizationDetailCardProps {
  organization: OrganizationDetails | null;
  canUpdate?: boolean;
  onCancel?: () => void;
}

export function OrganizationDetailCard({ organization, canUpdate = true, onCancel }: OrganizationDetailCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevOrganization, setPrevOrganization] = useState(organization);
  const [name, setName] = useState(organization?.name ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(organization?.imageUrl ?? null);

  if (organization !== prevOrganization) {
    setPrevOrganization(organization);
    setName(organization?.name ?? "");
    setPreviewUrl(organization?.imageUrl ?? null);
  }

  const [state, formAction, pending] = useActionState(
    updateOrganizationAction,
    initialBusinessActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleCancel = () => {
    setName(organization?.name ?? "");
    setPreviewUrl(organization?.imageUrl ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCancel?.();
  };

  if (!organization) {
    return (
      <div className="hidden flex-1 lg:block">
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <Building2 className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select an organization</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an organization to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden flex-1 lg:block">
      <Card className="rounded-xl border-border bg-card shadow-sm lg:ml-3 lg:h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
        <form action={formAction} className="flex flex-col min-h-0 flex-1">
          {/* Hidden inputs for form submit */}
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="currentPhotoUrl" value={organization.imageUrl ?? ""} />
          <input
            ref={fileInputRef}
            type="file"
            name="photoFile"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <CardContent className="p-0 flex flex-col min-h-0 flex-1 overflow-y-auto">
            {state.status === "error" && (
              <div className="p-6 pb-0">
                <ErrorAlert title="Unable to update organization" message={state.error ?? undefined} />
              </div>
            )}

            {/* Organization Logo Section */}
            <div className="flex flex-col border-b border-border">
              <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    {canUpdate ? (
                      <>
                        This is your organization logo.<br />
                        Click on the logo to upload a custom one from your files.
                      </>
                    ) : (
                      "This is the organization logo."
                    )}
                  </p>
                </div>
                <Avatar
                  className={`size-16 border border-border ${canUpdate ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`}
                  onClick={canUpdate ? handleAvatarClick : undefined}
                >
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <Building2 className="size-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            {/* Organization Name Section */}
            <div className="flex flex-col">
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Organization Name</h3>
                  {canUpdate && (
                    <p className="text-sm text-muted-foreground">
                      Please enter the official name for your organization.
                    </p>
                  )}
                </div>
                <div className="max-w-xs">
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Organization name"
                    maxLength={32}
                    disabled={!canUpdate}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {canUpdate && (
            <CardFooter className="shrink-0 justify-end gap-2 rounded-b-xl border-t border-border bg-card px-6 py-5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : <Save className="size-4" />}
                {pending ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
