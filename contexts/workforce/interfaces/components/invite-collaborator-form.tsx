"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { MailPlus } from "lucide-react";
import Link from "next/link";

import { createIdleActionState } from "@/contexts/shared/application/model/action-state";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/contexts/shared/interfaces/components/ui/field";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { inviteWorkforceMemberAction } from "../actions/workforce.actions";

type EstablishmentOption = Readonly<{ id: string; name: string }>;
type RoleOption = Readonly<{ id: string; name: string }>;

export function InviteCollaboratorForm({ organizationId, establishments, roles }: { organizationId: string; establishments: readonly EstablishmentOption[]; roles: readonly RoleOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = inviteWorkforceMemberAction.bind(null, organizationId);
  const [state, formAction, pending] = useActionState(action, createIdleActionState<{ invitationId: string }, { email?: string[]; establishmentId?: string[]; roleId?: string[] } | null>());
  const establishmentItems = useMemo(
    () => establishments.map(({ id, name }) => ({ value: id, label: name })),
    [establishments],
  );

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {roles.length === 0 && <Alert><MailPlus /><AlertTitle>Crea al menos un rol antes de invitar personal</AlertTitle><AlertDescription>Las invitaciones necesitan definir el acceso antes de enviarse. <Button variant="link" render={<Link href="/organization/roles/new" />}>Crear rol</Button></AlertDescription></Alert>}
      <ErrorAlert
        title="No se pudo enviar la invitación"
        message={state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />
      <FieldGroup className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(180px,0.55fr)_minmax(180px,0.55fr)_auto] md:items-end">
        <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.email)}>
          <FieldLabel htmlFor="invitation-email">Correo electrónico</FieldLabel>
          <Input id="invitation-email" name="email" type="email" autoComplete="email" placeholder="persona@empresa.com" required aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.email)} />
          <FieldError errors={state.status === "error" ? state.fieldErrors?.email?.map((message) => ({ message })) : undefined} />
        </Field>
        <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.establishmentId)}>
          <FieldLabel htmlFor="invitation-establishment">Establecimiento</FieldLabel>
          <Select name="establishmentId" items={establishmentItems} defaultValue={establishments[0]?.id} required>
            <SelectTrigger id="invitation-establishment" className="w-full"><SelectValue placeholder="Selecciona un establecimiento" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>{establishments.map((establishment) => <SelectItem key={establishment.id} value={establishment.id}>{establishment.name}</SelectItem>)}</SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={state.status === "error" ? state.fieldErrors?.establishmentId?.map((message) => ({ message })) : undefined} />
        </Field>
        <Field data-invalid={Boolean(state.status === "error" && state.fieldErrors?.roleId)}>
          <FieldLabel htmlFor="invitation-role">Rol</FieldLabel>
          <Select name="roleId" items={roles.map(({ id, name }) => ({ value: id, label: name }))} defaultValue={roles[0]?.id} required>
            <SelectTrigger id="invitation-role" className="w-full"><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
            <SelectContent><SelectGroup>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
          <FieldError errors={state.status === "error" ? state.fieldErrors?.roleId?.map((message) => ({ message })) : undefined} />
        </Field>
        <FormSubmitButton isSubmitting={pending} disabled={establishments.length === 0 || roles.length === 0} icon={<MailPlus />}>
          {pending ? "Enviando…" : "Invitar"}
        </FormSubmitButton>
      </FieldGroup>
    </form>
  );
}
