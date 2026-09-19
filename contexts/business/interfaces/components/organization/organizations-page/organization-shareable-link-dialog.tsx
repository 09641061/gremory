"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { cn } from "@/lib/utils";
import {
  isUuid,
  type ShareableInvitationExpiration,
  type WorkforceRoleResource,
} from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

import type { EstablishmentOption } from "./organization-members-panel";

const EXPIRATION_OPTIONS: ReadonlyArray<{ value: ShareableInvitationExpiration; label: string }> = [
  { value: "ONE_HOUR", label: "1 Hour" },
  { value: "ONE_DAY", label: "1 Day" },
  { value: "SEVEN_DAYS", label: "7 Days" },
  { value: "THIRTY_DAYS", label: "30 Days" },
];

interface ShareableLinkDialogProps {
  organizationId: string;
  establishments: ReadonlyArray<EstablishmentOption>;
  roles: ReadonlyArray<WorkforceRoleResource>;
  onClose: () => void;
  /** Called after a link is persisted so the parent can rehydrate its table cache. */
  onGenerated?: () => void;
}

/** Single-step modal that issues a shareable, multi-use invitation link. */
export function ShareableLinkDialog({
  organizationId,
  establishments,
  roles,
  onClose,
  onGenerated,
}: ShareableLinkDialogProps) {
  const systemRoles = roles.filter((role) => role.systemRole && role.name !== "Owner");
  const customRoles = roles.filter((role) => !role.systemRole);
  const fallbackBaseRoleId =
    systemRoles.find((role) => role.name === "Member")?.id ?? systemRoles[0]?.id ?? "";

  const [baseRoleId, setBaseRoleId] = useState(fallbackBaseRoleId);
  const [customRoleIds, setCustomRoleIds] = useState<string[]>([]);
  const [selectedEstablishmentIds, setSelectedEstablishmentIds] = useState<string[]>(
    establishments.map((establishment) => establishment.id),
  );
  const [expiration, setExpiration] = useState<ShareableInvitationExpiration>("ONE_DAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const systemRoleOptions = systemRoles.map((role) => ({ value: role.id, label: role.name }));
  const systemRoleLabel = (value: string) =>
    systemRoleOptions.find((option) => option.value === value)?.label ?? "Member";
  const expirationLabel = (value: string) =>
    EXPIRATION_OPTIONS.find((option) => option.value === value)?.label ?? "1 Day";

  function toggleCustomRole(roleId: string) {
    setCustomRoleIds((current) =>
      current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
    );
  }

  function toggleEstablishment(establishmentId: string) {
    setSelectedEstablishmentIds((current) =>
      current.includes(establishmentId)
        ? current.filter((id) => id !== establishmentId)
        : [...current, establishmentId],
    );
  }

  async function generateLink() {
    if (!isUuid(organizationId)) return;
    if (selectedEstablishmentIds.length === 0) {
      setError("Select at least one establishment.");
      return;
    }
    const roleIds = Array.from(
      new Set([baseRoleId || fallbackBaseRoleId, ...customRoleIds]),
    ).filter((id) => isUuid(id));

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/workforce/invitations/shareable-links", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Organization-Id": organizationId },
        body: JSON.stringify({
          establishmentIds: selectedEstablishmentIds,
          roleIds,
          expiration,
        }),
      });
      const body: unknown = await response.json().catch(() => undefined);
      if (!response.ok) throw new Error(readErrorMessage(body));
      const link = body as { url: string; expiresAt: string };
      setGenerated({ url: link.url, expiresAt: link.expiresAt });
      // Rehydrate the Invite Links table immediately while the copy screen is shown.
      onGenerated?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to generate the link.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      setCopied(true);
    } catch {
      setError("Copying is not available in this browser.");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-4" aria-hidden="true" />
            Generate Invite Link
          </DialogTitle>
          <DialogDescription>
            Create a shareable link that pre-authorizes store access and roles until it expires.
          </DialogDescription>
        </DialogHeader>

        {generated ? (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Your shareable link is ready. Copy it and send it to your team.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generated.url}
                aria-label="Shareable invitation link"
                onFocus={(event) => event.target.select()}
                className="flex-1"
              />
              <Button type="button" onClick={() => void copyLink()} className="gap-2">
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(generated.expiresAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium">
              Base System Role
              <Select
                items={systemRoleOptions}
                value={baseRoleId || fallbackBaseRoleId}
                onValueChange={(next) => setBaseRoleId(typeof next === "string" ? next : "")}
              >
                <SelectTrigger aria-label="Base System Role" className="w-full">
                  <SelectValue placeholder="Member">
                    {(value: string | null) => (
                      <span className="truncate font-medium text-foreground">
                        {systemRoleLabel(value ?? fallbackBaseRoleId)}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {systemRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="grid gap-2 text-sm font-medium">
              <span>Custom Roles</span>
              <div className="flex flex-wrap gap-2 rounded-lg border border-input p-3">
                {customRoles.length === 0 ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    No custom roles available
                  </span>
                ) : (
                  customRoles.map((role) => {
                    const selected = customRoleIds.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleCustomRole(role.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {role.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Establishment Access</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {establishments.map((establishment) => (
                  <label
                    key={establishment.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEstablishmentIds.includes(establishment.id)}
                      onChange={() => toggleEstablishment(establishment.id)}
                      className="size-4 accent-primary"
                    />
                    {establishment.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="grid gap-2 text-sm font-medium">
              Link Expiration
              <Select
                items={EXPIRATION_OPTIONS}
                value={expiration}
                onValueChange={(next) =>
                  setExpiration((typeof next === "string" ? next : "ONE_DAY") as ShareableInvitationExpiration)
                }
              >
                <SelectTrigger aria-label="Link Expiration" className="w-full">
                  <SelectValue placeholder="1 Day">
                    {(value: string | null) => (
                      <span className="truncate font-medium text-foreground">
                        {expirationLabel(value ?? "ONE_DAY")}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          </div>
        )}

        <DialogFooter>
          {generated ? (
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void generateLink()}
                disabled={submitting}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {submitting ? "Generating..." : "Generate Link"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
