"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, useActionState } from "react";
import { Plus, Store, Trash2 } from "lucide-react";
import { z } from "zod";

import {
  createEstablishmentAction,
  deleteEstablishmentAction,
  updateEstablishmentAction,
} from "@/contexts/business/interfaces/actions/establishment.actions";
import { initialBusinessActionResult } from "@/contexts/business/interfaces/actions/business-action-result";
import { TimeZoneField } from "@/contexts/business/interfaces/components/establishment/time-zone-field";
import {
  MAX_ESTABLISHMENT_NAME_LENGTH,
  MIN_ESTABLISHMENT_NAME_LENGTH,
} from "@/contexts/business/domain/model/valueobjects/establishment-name.vo";
import { establishmentResponseSchema } from "@/contexts/business/interfaces/rest/schemas/establishment.schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";

type EstablishmentResource = z.infer<typeof establishmentResponseSchema>;

const establishmentListSchema = z.object({ content: z.array(establishmentResponseSchema) });

const DEFAULT_TIME_ZONE = "America/Lima";
const NEW_ESTABLISHMENT = "__new__";

/**
 * Establishments tab: a single unified block that navigates the organization's
 * locations (Zone 1), edits the selected location's parameters (Zone 2) and
 * commits them through the existing authenticated establishment actions (Zone 3).
 */
export function OrganizationEstablishmentsPanel({
  organizationId,
  canUpdate = false,
  canCreate = false,
}: {
  organizationId: string;
  canUpdate?: boolean;
  canCreate?: boolean;
}) {
  const [list, setList] = useState<EstablishmentResource[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [address, setAddress] = useState("");
  const [photoChosen, setPhotoChosen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const [createState, createFormAction, createPending] = useActionState(
    createEstablishmentAction,
    initialBusinessActionResult,
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateEstablishmentAction,
    initialBusinessActionResult,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteEstablishmentAction,
    initialBusinessActionResult,
  );

  const pending = createPending || updatePending || deletePending;
  const selected = creating ? null : list.find((item) => item.id === selectedId) ?? null;
  const disabled = pending || (creating ? !canCreate : !canUpdate);

  const hydrate = useCallback((establishment: EstablishmentResource | null) => {
    setName(establishment?.name ?? "");
    setTimeZone(establishment?.timeZone ?? DEFAULT_TIME_ZONE);
    setAddress("");
    setPhotoChosen(false);
    setFormKey((current) => current + 1);
  }, []);

  const loadList = useEffectEvent(async (preferId?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/business/establishments/organization/${organizationId}?page=0&size=100`,
      );
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body));
      const content = establishmentListSchema.parse(body).content;
      setList(content);

      const nextId = preferId && content.some((item) => item.id === preferId)
        ? preferId
        : content[0]?.id ?? "";
      setCreating(false);
      setSelectedId(nextId);
      hydrate(content.find((item) => item.id === nextId) ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load establishments.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const timer = window.setTimeout(() => void loadList(), 0);
    return () => window.clearTimeout(timer);
  }, [organizationId]);

  const onMutationSuccess = useEffectEvent((preferId: string | null) => {
    void loadList(preferId);
  });

  useEffect(() => {
    if (createState.status !== "success") return;
    const timer = window.setTimeout(
      () => onMutationSuccess(createState.data?.id ?? null),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [createState.status, createState.data]);

  useEffect(() => {
    if (updateState.status !== "success") return;
    const timer = window.setTimeout(
      () => onMutationSuccess(updateState.data?.id ?? null),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [updateState.status, updateState.data]);

  useEffect(() => {
    if (deleteState.status !== "success") return;
    const timer = window.setTimeout(() => onMutationSuccess(null), 0);
    return () => window.clearTimeout(timer);
  }, [deleteState.status]);

  function selectEstablishment(id: string) {
    setSelectedId(id);
    setCreating(false);
    setError(null);
    hydrate(list.find((item) => item.id === id) ?? null);
  }

  function startCreate() {
    setCreating(true);
    setSelectedId(NEW_ESTABLISHMENT);
    setError(null);
    hydrate(null);
  }

  function cancel() {
    if (!creating && selected) {
      hydrate(selected);
      return;
    }
    const fallback = list[0];
    if (fallback) {
      selectEstablishment(fallback.id);
    } else {
      setCreating(false);
      setSelectedId("");
      hydrate(null);
    }
  }

  const handlePhotoSelect = useCallback((file: File | null) => {
    setPhotoChosen(file !== null);
  }, []);

  const sanitizedName = name.replace(/[^a-zA-Z]/g, "");
  const isNameValid =
    name.length >= MIN_ESTABLISHMENT_NAME_LENGTH && name.length <= MAX_ESTABLISHMENT_NAME_LENGTH;
  const isDirty = creating
    ? sanitizedName.length > 0 || photoChosen || timeZone !== DEFAULT_TIME_ZONE
    : selected
      ? name !== selected.name ||
        timeZone !== (selected.timeZone ?? DEFAULT_TIME_ZONE) ||
        photoChosen
      : false;
  const canSave = !pending && isNameValid && (creating ? canCreate : canUpdate && isDirty);
  const onlyLocation = list.length <= 1;
  const actionError =
    createState.status === "error"
      ? createState.error
      : updateState.status === "error"
        ? updateState.error
        : deleteState.status === "error"
          ? deleteState.error
          : null;

  const establishmentOptions = list.map((establishment) => ({
    value: establishment.id,
    label: establishment.name,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      {error || actionError ? (
        <ErrorAlert
          title={creating ? "Unable to create establishment" : "Unable to update establishment"}
          message={actionError ?? error ?? undefined}
        />
      ) : null}

      {/* ZONE 1 - navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-2">
          <span className="shrink-0 text-sm font-medium text-foreground">Establishment:</span>
          <div className="min-w-0 flex-1">
            {creating ? (
              <div
                aria-label="Establishment"
                className="flex h-(--app-control-height) w-full items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm font-medium text-foreground"
              >
                <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                New Establishment
              </div>
            ) : (
              <Select
                items={establishmentOptions}
                value={selectedId || null}
                onValueChange={(next) => selectEstablishment(typeof next === "string" ? next : "")}
                disabled={pending || loading || list.length === 0}
              >
                <SelectTrigger aria-label="Establishment" className="w-full">
                  <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                  <SelectValue placeholder="Select establishment">
                    {(value: string | null) => (
                      <span className="truncate font-medium text-foreground">
                        {value ? optionLabel(establishmentOptions, value) : "Select establishment"}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {establishmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {canCreate ? (
          <Button
            type="button"
            onClick={startCreate}
            disabled={pending || creating}
            className="gap-2 sm:ml-auto"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create establishment
          </Button>
        ) : null}
      </div>

      {/* ZONE 2 + 3 - parameters and actions */}
      <form
        key={formKey}
        action={creating ? createFormAction : updateFormAction}
        className="flex flex-col gap-6"
      >
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="redirect" value="false" />
        {!creating ? <input type="hidden" name="id" value={selectedId} /> : null}
        {!creating ? (
          <input type="hidden" name="currentPhotoUrl" value={selected?.photoUrl ?? ""} />
        ) : null}
        <input type="hidden" name="removePhoto" value="false" />

        <div className="grid gap-6 border-b border-border pb-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-2">
            <ImageUploadAvatar
              name="photoFile"
              alt={name || "Establishment"}
              initialUrl={creating ? null : selected?.photoUrl ?? null}
              fallbackIcon={<Store className="size-8 text-muted-foreground" />}
              onFileSelect={handlePhotoSelect}
              className="size-24"
            />
            <span className="text-xs text-muted-foreground">Establishment photo</span>
          </div>

          <div className="grid content-start gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="establishment-name" className="text-sm font-medium text-foreground">
                Establishment Name
              </label>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {name.length}/{MAX_ESTABLISHMENT_NAME_LENGTH}
              </span>
            </div>
            <Input
              id="establishment-name"
              name="name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                    .replace(/[^a-zA-Z]/g, "")
                    .slice(0, MAX_ESTABLISHMENT_NAME_LENGTH),
                )
              }
              placeholder="Establishment name"
              maxLength={MAX_ESTABLISHMENT_NAME_LENGTH}
              minLength={MIN_ESTABLISHMENT_NAME_LENGTH}
              pattern="^[a-zA-Z]+$"
              autoComplete="organization"
              spellCheck={false}
              disabled={disabled}
              required
              className="max-w-md"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Time zone</span>
          <div className="max-w-md">
            <TimeZoneField
              name="timeZone"
              value={timeZone}
              onChange={setTimeZone}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="establishment-address" className="text-sm font-medium text-foreground">
            Address / Location <span className="text-muted-foreground">(Optional)</span>
          </label>
          <Input
            id="establishment-address"
            name="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street address..."
            autoComplete="street-address"
            disabled={disabled}
            className="max-w-md"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            disabled={pending || creating || !canUpdate || onlyLocation}
            title={
              onlyLocation
                ? "The only active establishment cannot be deleted"
                : "Delete this establishment"
            }
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete Establishment
          </Button>

          <div className="flex items-center gap-3 sm:ml-auto">
            <Button type="button" variant="outline" onClick={cancel} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSave}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Saving...
                </span>
              ) : creating ? (
                "Create establishment"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>

      <form ref={deleteFormRef} action={deleteFormAction} className="hidden">
        <input type="hidden" name="id" value={selectedId} />
      </form>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => setDeleteOpen(open)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Establishment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selected?.name}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => deleteFormRef.current?.requestSubmit()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type EstablishmentOption = { value: string; label: string };

function optionLabel(options: ReadonlyArray<EstablishmentOption>, value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function readErrorMessage(value: unknown): string {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string"
    ? value.message
    : "Unable to complete the request.";
}
