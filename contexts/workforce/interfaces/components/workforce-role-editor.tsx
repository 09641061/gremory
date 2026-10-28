"use client";

import { useActionState, useMemo, useState } from "react";
import { AlertTriangle, LockKeyhole, ShieldCheck } from "lucide-react";

import type { WorkforcePermissionDefinition, WorkforcePermissionGrant, WorkforcePermissionScope, WorkforceRole } from "../../application/model/workforce";
import { createIdleActionState } from "@/contexts/shared/application/model/action-state";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Checkbox } from "@/contexts/shared/interfaces/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/contexts/shared/interfaces/components/ui/field";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/contexts/shared/interfaces/components/ui/toggle-group";
import { saveWorkforceRoleAction } from "../actions/workforce.actions";

const scopeLabels: Record<WorkforcePermissionScope, string> = {
  SELF: "Propio",
  ESTABLISHMENT: "Sede",
  ORGANIZATION: "Organización",
};

export function WorkforceRoleEditor({ organizationId, permissions, role }: {
  organizationId: string;
  permissions: readonly WorkforcePermissionDefinition[];
  role?: WorkforceRole;
}) {
  const initial = useMemo(() => new Map(role?.selectedGrants.map((grant) => [grant.permissionKey, grant.scope]) ?? []), [role]);
  const [selected, setSelected] = useState(initial);
  const action = saveWorkforceRoleAction.bind(null, organizationId, role?.id ?? null);
  const [state, formAction, pending] = useActionState(action, createIdleActionState<{ roleId: string }, { name?: string[]; description?: string[] } | null>());
  const grouped = useMemo(() => Map.groupBy(permissions, (permission) => permission.group), [permissions]);
  const selectedGrants = [...selected].map(([permissionKey, scope]) => ({ permissionKey, scope }));
  const effective = useMemo(() => effectiveKeys(selectedGrants, permissions), [selectedGrants, permissions]);
  const previous = new Set(role?.effectiveGrants.map((grant) => grant.permissionKey) ?? []);
  const gained = [...effective].filter((key) => !previous.has(key));
  const lost = [...previous].filter((key) => !effective.has(key));
  const sensitive = permissions.filter((permission) => permission.sensitive && effective.has(permission.key));

  function togglePermission(permission: WorkforcePermissionDefinition, checked: boolean) {
    setSelected((current) => {
      const next = new Map(current);
      if (checked) next.set(permission.key, permission.allowedScopes[0]);
      else next.delete(permission.key);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="selectedGrants" value={JSON.stringify(selectedGrants)} />
      {role && <input type="hidden" name="version" value={role.version} />}
      <ErrorAlert title="No se pudo guardar el rol" message={state.status === "error" ? state.error : undefined} resetKey={pending ? "pending" : state.status} />

      <Card>
        <CardHeader><CardTitle>Información del rol</CardTitle><CardDescription>El nombre ayuda a organizar al equipo; nunca se usa para autorizar acciones.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.name)}>
              <FieldLabel htmlFor="role-name">Nombre</FieldLabel>
              <Input id="role-name" name="name" defaultValue={role?.name} minLength={2} maxLength={50} required aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.name)} />
              <FieldDescription>Entre 2 y 50 caracteres. “Owner”, “Dueño” y “Propietario” están reservados.</FieldDescription>
              <FieldError errors={state.status === "error" ? state.fieldErrors?.name?.map((message) => ({ message })) : undefined} />
            </Field>
            <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.description)}>
              <FieldLabel htmlFor="role-description">Descripción</FieldLabel>
              <Textarea id="role-description" name="description" defaultValue={role?.description ?? ""} maxLength={160} rows={3} aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.description)} />
              <FieldDescription>Opcional. Explica cuándo debe usarse este rol.</FieldDescription>
              <FieldError errors={state.status === "error" ? state.fieldErrors?.description?.map((message) => ({ message })) : undefined} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {[...grouped].map(([group, groupPermissions]) => (
        <Card key={group}>
          <CardHeader><CardTitle>{group}</CardTitle><CardDescription>Selecciona capacidades y el alcance máximo permitido.</CardDescription></CardHeader>
          <CardContent>
            <FieldSet><FieldLegend className="sr-only">Permisos de {group}</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                {groupPermissions.map((permission) => {
                  const scope = selected.get(permission.key);
                  return (
                    <Field key={permission.key} orientation="horizontal" className="min-h-11 rounded-lg border p-3">
                      <Checkbox id={permission.key} checked={Boolean(scope)} onCheckedChange={(checked) => togglePermission(permission, checked === true)} aria-label={permission.label} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-0.5">
                          <FieldLabel htmlFor={permission.key}>{permission.label}</FieldLabel>
                          <FieldDescription>{permission.description}</FieldDescription>
                        </div>
                        {scope && (
                          <ToggleGroup value={[scope]} onValueChange={(values) => {
                            const nextScope = values.at(-1) as WorkforcePermissionScope | undefined;
                            if (nextScope) setSelected((current) => new Map(current).set(permission.key, nextScope));
                          }} variant="outline" size="sm" spacing={0} aria-label={`Alcance de ${permission.label}`}>
                            {permission.allowedScopes.map((allowed) => <ToggleGroupItem key={allowed} value={allowed}>{scopeLabels[allowed]}</ToggleGroupItem>)}
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
        <CardHeader><CardTitle>Resumen</CardTitle><CardDescription>El backend volverá a validar el catálogo, los alcances y las dependencias.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={effective.size === 0 ? "destructive" : "secondary"}>{effective.size === 0 ? "Sin acceso" : `${effective.size} permisos efectivos`}</Badge>
            {role && <Badge variant="outline">{role.activeMemberCount} persona{role.activeMemberCount === 1 ? "" : "s"} afectada{role.activeMemberCount === 1 ? "" : "s"}</Badge>}
            {gained.length > 0 && <Badge>+{gained.length} accesos</Badge>}
            {lost.length > 0 && <Badge variant="destructive">−{lost.length} accesos</Badge>}
          </div>
          {sensitive.length > 0 && <Alert><AlertTriangle /><AlertTitle>Permisos sensibles</AlertTitle><AlertDescription>{sensitive.map((permission) => permission.label).join(", ")}.</AlertDescription></Alert>}
          <Alert><LockKeyhole /><AlertTitle>Facultades protegidas</AlertTitle><AlertDescription>Este rol nunca podrá gestionar roles, invitaciones, bajas, propiedad, límites del plan ni medios de pago.</AlertDescription></Alert>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <FormSubmitButton isSubmitting={pending} icon={<ShieldCheck />}>{pending ? "Guardando…" : role ? "Guardar cambios" : "Crear rol"}</FormSubmitButton>
      </div>
    </form>
  );
}

function effectiveKeys(selected: readonly WorkforcePermissionGrant[], definitions: readonly WorkforcePermissionDefinition[]) {
  const keys = new Set(selected.map((grant) => grant.permissionKey));
  let changed = true;
  while (changed) {
    changed = false;
    for (const definition of definitions) {
      if (!keys.has(definition.key)) continue;
      for (const dependency of definition.dependencies) if (!keys.has(dependency)) { keys.add(dependency); changed = true; }
    }
  }
  return keys;
}
