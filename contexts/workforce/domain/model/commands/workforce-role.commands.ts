export type CreateWorkforceRoleCommand = Readonly<{
  name: string;
  permissions: ReadonlyArray<string>;
}>;

export type UpdateWorkforceRoleCommand = Readonly<{
  roleId: string;
  name: string;
  permissions: ReadonlyArray<string>;
}>;

export type DeleteWorkforceRoleCommand = Readonly<{
  roleId: string;
}>;

export type AssignWorkforceRoleCommand = Readonly<{
  memberId: string;
  roleId: string;
}>;

export function createWorkforceRoleCommand(
  input: CreateWorkforceRoleCommand,
): CreateWorkforceRoleCommand {
  return Object.freeze({
    name: input.name,
    permissions: Object.freeze([...input.permissions]),
  });
}

export function updateWorkforceRoleCommand(
  input: UpdateWorkforceRoleCommand,
): UpdateWorkforceRoleCommand {
  return Object.freeze({
    roleId: input.roleId,
    name: input.name,
    permissions: Object.freeze([...input.permissions]),
  });
}

export function deleteWorkforceRoleCommand(
  input: DeleteWorkforceRoleCommand,
): DeleteWorkforceRoleCommand {
  return Object.freeze({ ...input });
}

export function assignWorkforceRoleCommand(
  input: AssignWorkforceRoleCommand,
): AssignWorkforceRoleCommand {
  return Object.freeze({ ...input });
}
