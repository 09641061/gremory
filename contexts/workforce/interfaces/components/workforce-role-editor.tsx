"use client";

import { useActionState, useMemo, useState } from "react";
import { AlertTriangle, LockKeyhole, ShieldCheck } from "lucide-react";

import type {
  WorkforcePermissionDefinition,
  WorkforcePermissionScope,
  WorkforceRole,
} from "../../application/model/workforce";
import { createIdleActionState } from "@/contexts/shared/application/model/action-state";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Checkbox } from "@/contexts/shared/interfaces/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/contexts/shared/interfaces/components/ui/field";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/contexts/shared/interfaces/components/ui/toggle-group";
import { saveWorkforceRoleAction } from "../actions/workforce.actions";

const scopeLabels: Record<WorkforcePermissionScope, string> = {
  SELF: "Solo lo propio",
  ESTABLISHMENT: "Su sede",
  ORGANIZATION: "Toda la organización",
};
const scopeOrder: readonly WorkforcePermissionScope[] = ["SELF", "ESTABLISHMENT", "ORGANIZATION"];
const groupDescriptions: Record<string, string> = {
  "Operación diaria": "Áreas que el equipo usa para atender clientes y mantener la agenda al día.",
  Herramientas: "Funciones personales que complementan el trabajo de cada colaborador.",
  Administración: "Configuración e información sensible reservada para personas de confianza.",
};

export function WorkforceRoleEditor({ organizationId, permissions, role }: {
  organizationId: string;
  permissions: readonly WorkforcePermissionDefinition[];
  role?: WorkforceRole;
}) {
  const selectableKeys = useMemo(() => new Set(permissions.map((permission) => permission.key)), [permissions]);
  const initial = useMemo(() => new Map(
    role?.selectedGrants
      .filter((grant) => selectableKeys.has(grant.permissionKey))
      .map((grant) => [grant.permissionKey, grant.scope]) ?? [],
  ), [role, selectableKeys]);
  const legacyGrants = useMemo(() => role?.selectedGrants
    .filter((grant) => !selectableKeys.has(grant.permissionKey)) ?? [], [role, selectableKeys]);
  const [selected, setSelected] = useState(initial);
  const [touchedPermissions, setTouchedPermissions] = useState<ReadonlySet<string>>(new Set());
  const action = saveWorkforceRoleAction.bind(null, organizationId, role?.id ?? null);
  const [state, formAction, pending] = useActionState(
    action,
    createIdleActionState<{ roleId: string }, { name?: string[]; description?: string[] } | null>(),
  );
  const grouped = useMemo(() => Map.groupBy(permissions, (permission) => permission.group), [permissions]);
  const preservedLegacyGrants = legacyGrants.filter((grant) => shouldPreserveLegacyGrant(
    grant.permissionKey,
    permissions,
    touchedPermissions,
  ));
  const selectedGrants = [...selected]
    .map(([permissionKey, scope]) => ({ permissionKey, scope }))
    .concat(preservedLegacyGrants);
  const sensitive = permissions.filter((permission) => permission.sensitive && selected.has(permission.key));

  function togglePermission(permission: WorkforcePermissionDefinition, checked: boolean) {
    setTouchedPermissions((current) => new Set(current).add(permission.key));
    setSelected((current) => {
      const next = new Map(current);
      if (checked) next.set(permission.key, preferredScope(permission, next.get(permission.key)));
      else next.delete(permission.key);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="selectedGrants" value={JSON.stringify(selectedGrants)} />
      {role && <input type="hidden" name="version" value={role.version} />}
      <ErrorAlert
        title="No se pudo guardar el rol"
        message={state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />

      <Card>
        <CardHeader>
          <CardTitle>Información del rol</CardTitle>
          <CardDescription>Usa nombres claros como Administrador, Recepción o Especialista.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.name)}>
              <FieldLabel htmlFor="role-name">Nombre</FieldLabel>
              <Input
                id="role-name"
                name="name"
                defaultValue={role?.name}
                minLength={2}
                maxLength={50}
                required
                aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.name)}
              />
              <FieldDescription>Entre 2 y 50 caracteres. “Owner”, “Dueño” y “Propietario” están reservados.</FieldDescription>
              <FieldError errors={state.status === "error" ? state.fieldErrors?.name?.map((message) => ({ message })) : undefined} />
            </Field>
            <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.description)}>
              <FieldLabel htmlFor="role-description">Descripción</FieldLabel>
              <Textarea
                id="role-description"
                name="description"
                defaultValue={role?.description ?? ""}
                maxLength={160}
                rows={3}
                aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.description)}
              />
              <FieldDescription>Opcional. Explica para qué personas debe usarse este rol.</FieldDescription>
              <FieldError errors={state.status === "error" ? state.fieldErrors?.description?.map((message) => ({ message })) : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Alert>
        <ShieldCheck />
        <AlertTitle>Acceso por áreas</AlertTitle>
        <AlertDescription>
          Al activar un área se incluyen sus acciones habituales. El alcance limita si la persona trabaja con lo propio, su sede o toda la organización.
        </AlertDescription>
      </Alert>

      {preservedLegacyGrants.length > 0 && (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Configuración anterior conservada</AlertTitle>
          <AlertDescription>
            Este rol mantiene {preservedLegacyGrants.length} acceso{preservedLegacyGrants.length === 1 ? "" : "s"} de la versión anterior. Solo se reemplazarán cuando revises el área relacionada.
          </AlertDescription>
        </Alert>
      )}

      {[...grouped].map(([group, groupPermissions]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
            <CardDescription>{groupDescriptions[group] ?? "Selecciona las áreas disponibles para este rol."}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend className="sr-only">Áreas de {group}</FieldLegend>
              <FieldGroup data-slot="permission-area-group">
                {groupPermissions.map((permission) => {
                  const scope = selected.get(permission.key);
                  const allowedScopes = orderedScopes(permission);
                  return (
                    <Field key={permission.key} orientation="horizontal" className="min-h-11 rounded-lg border p-3">
                      <Checkbox
                        id={permission.key}
                        checked={Boolean(scope)}
                        onCheckedChange={(checked) => togglePermission(permission, checked === true)}
                        aria-label={permission.label}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-0.5">
                          <FieldLabel htmlFor={permission.key}>{permission.label}</FieldLabel>
                          <FieldDescription>{permission.description}</FieldDescription>
                        </div>
                        {scope && allowedScopes.length === 1 && (
                          <Badge variant="outline" className="shrink-0">{scopeLabels[scope]}</Badge>
                        )}
                        {scope && allowedScopes.length > 1 && (
                          <ToggleGroup
                            value={[scope]}
                            onValueChange={(values) => {
                              const nextScope = values.at(-1) as WorkforcePermissionScope | undefined;
                              if (nextScope) {
                                setTouchedPermissions((current) => new Set(current).add(permission.key));
                                setSelected((current) => new Map(current).set(permission.key, nextScope));
                              }
                            }}
                            variant="outline"
                            size="sm"
                            spacing={0}
                            aria-label={`Alcance de ${permission.label}`}
                          >
                            {allowedScopes.map((allowed) => (
                              <ToggleGroupItem key={allowed} value={allowed}>{scopeLabels[allowed]}</ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        )}
                      </div>
                    </Field>
                  );
                })}
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Takodu aplicará internamente todos los permisos necesarios para cada área.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {selected.size > 0 ? (
              <Badge variant="secondary">{selected.size} área{selected.size === 1 ? "" : "s"} activa{selected.size === 1 ? "" : "s"}</Badge>
            ) : preservedLegacyGrants.length > 0 ? (
              <Badge variant="secondary">Acceso anterior conservado</Badge>
            ) : (
              <Badge variant="destructive">Sin acceso</Badge>
            )}
            {role && (
              <Badge variant="outline">
                {role.activeMemberCount} persona{role.activeMemberCount === 1 ? "" : "s"} afectada{role.activeMemberCount === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          {sensitive.length > 0 && (
            <Alert>
              <AlertTriangle />
              <AlertTitle>Áreas sensibles</AlertTitle>
              <AlertDescription>{sensitive.map((permission) => permission.label).join(", ")}.</AlertDescription>
            </Alert>
          )}
          <Alert>
            <LockKeyhole />
            <AlertTitle>Facultades protegidas</AlertTitle>
            <AlertDescription>
              Solo el Dueño puede gestionar roles, invitaciones, bajas, propiedad, límites del plan y medios de pago.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <FormSubmitButton isSubmitting={pending} icon={<ShieldCheck />}>
          {pending ? "Guardando…" : role ? "Guardar cambios" : "Crear rol"}
        </FormSubmitButton>
      </div>
    </form>
  );
}

function orderedScopes(permission: WorkforcePermissionDefinition) {
  return scopeOrder.filter((scope) => permission.allowedScopes.includes(scope));
}

function preferredScope(permission: WorkforcePermissionDefinition, current?: WorkforcePermissionScope) {
  if (current && permission.allowedScopes.includes(current)) return current;
  const first = orderedScopes(permission)[0];
  if (!first) throw new Error(`El área ${permission.key} no tiene un alcance válido.`);
  return first;
}

function shouldPreserveLegacyGrant(
  permissionKey: string,
  permissions: readonly WorkforcePermissionDefinition[],
  touchedPermissions: ReadonlySet<string>,
) {
  const related = permissions.filter((permission) => permission.dependencies.includes(permissionKey));
  return related.length === 0 || related.some((permission) => !touchedPermissions.has(permission.key));
}
