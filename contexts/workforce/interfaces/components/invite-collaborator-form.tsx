"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { MailPlus } from "lucide-react";

import { createIdleActionState } from "@/contexts/shared/application/model/action-state";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { FormSubmitButton } from "@/contexts/shared/interfaces/components/form/form-submit-button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/contexts/shared/interfaces/components/ui/field";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import { inviteWorkforceMemberAction } from "../actions/workforce.actions";

type EstablishmentOption = Readonly<{ id: string; name: string }>;

export function InviteCollaboratorForm({ organizationId, establishments }: { organizationId: string; establishments: readonly EstablishmentOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = inviteWorkforceMemberAction.bind(null, organizationId);
  const [state, formAction, pending] = useActionState(action, createIdleActionState<{ invitationId: string }, { email?: string[]; establishmentId?: string[] } | null>());
  const establishmentItems = useMemo(
    () => establishments.map(({ id, name }) => ({ value: id, label: name })),
    [establishments],
  );

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <ErrorAlert
        title="No se pudo enviar la invitación"
        message={state.status === "error" ? state.error : undefined}
        resetKey={pending ? "pending" : state.status}
      />
      <FieldGroup className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.65fr)_auto] md:items-end">
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
              {establishments.map((establishment) => <SelectItem key={establishment.id} value={establishment.id}>{establishment.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError errors={state.status === "error" ? state.fieldErrors?.establishmentId?.map((message) => ({ message })) : undefined} />
        </Field>
        <FormSubmitButton isSubmitting={pending} disabled={establishments.length === 0} icon={<MailPlus />}>
          {pending ? "Enviando…" : "Invitar"}
        </FormSubmitButton>
      </FieldGroup>
    </form>
  );
}
