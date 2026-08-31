export type CreateWorkforceRoleCommand = Readonly<{
  name: string;
  position?: number;
}>;

export type PatchWorkforceRoleCommand = Readonly<{
  roleId: string;
  name?: string;
  permissions?: ReadonlyArray<string>;
  position?: number;
}>;

export type DeleteWorkforceRoleCommand = Readonly<{
  roleId: string;
}>;

export type AssignWorkforceRoleCommand = Readonly<{
  memberId: string;
  roleId: string;
}>;

export type RemoveWorkforceRoleAssignmentCommand = AssignWorkforceRoleCommand;

export function createWorkforceRoleCommand(
  input: CreateWorkforceRoleCommand,
): CreateWorkforceRoleCommand {
  return Object.freeze({
    name: input.name,
    position: input.position,
  });
}

export function patchWorkforceRoleCommand(
  input: PatchWorkforceRoleCommand,
): PatchWorkforceRoleCommand {
  const permissions = input.permissions === undefined
    ? undefined
    : Object.freeze([...input.permissions]);
  return Object.freeze({
    roleId: input.roleId,
    name: input.name,
    permissions,
    position: input.position,
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

export function removeWorkforceRoleAssignmentCommand(
  input: RemoveWorkforceRoleAssignmentCommand,
): RemoveWorkforceRoleAssignmentCommand {
  return Object.freeze({ ...input });
}
