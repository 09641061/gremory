import type { WorkforcePermission } from "../enums/workforce-permission";

export interface WorkforceRoleProps {
  id: string | null;
  name: string;
  permissions: ReadonlyArray<WorkforcePermission>;
  systemRole: boolean;
  position?: number;
}

export class WorkforceRole {
  private constructor(
    public readonly id: string | null,
    private name: string,
    private permissions: WorkforcePermission[],
    private readonly systemRole: boolean,
    public readonly position: number,
  ) {}

  static create(props: Omit<WorkforceRoleProps, "id">): WorkforceRole {
    const position = props.position ?? 1;
    if (!Number.isInteger(position) || position < 1) throw new Error("Role position must be positive");
    const normalized = normalizeRole(props.name, props.permissions);
    return new WorkforceRole(null, normalized.name, normalized.permissions, props.systemRole, position);
  }

  static rehydrate(props: WorkforceRoleProps): WorkforceRole {
    const normalized = normalizeRole(props.name, props.permissions);
    const position = props.position ?? 1;
    if (!Number.isInteger(position) || position < 1) throw new Error("Role position must be positive");
    return new WorkforceRole(props.id, normalized.name, normalized.permissions, props.systemRole, position);
  }

  rename(name: string): void {
    const normalized = normalizeName(name);
    this.name = normalized;
  }

  replacePermissions(permissions: ReadonlyArray<WorkforcePermission>): void {
    this.permissions = normalizePermissions(permissions);
  }

  getName(): string {
    return this.name;
  }

  getPermissions(): ReadonlyArray<WorkforcePermission> {
    return Object.freeze([...this.permissions]);
  }

  isSystemRole(): boolean {
    return this.systemRole;
  }

  isImmutable(): boolean {
    return this.systemRole;
  }
}

function normalizeRole(
  name: string,
  permissions: ReadonlyArray<WorkforcePermission>,
) {
  return {
    name: normalizeName(name),
    permissions: normalizePermissions(permissions),
  };
}

function normalizeName(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Role name is required");
  }
  if (normalized.length > 100) {
    throw new Error("Role name must not exceed 100 characters");
  }
  return normalized;
}

function normalizePermissions(
  permissions: ReadonlyArray<WorkforcePermission>,
): WorkforcePermission[] {
  if (!permissions) {
    throw new Error("Role permissions are required");
  }
  return [...new Set(permissions.map((permission) => permission.trim() as WorkforcePermission))];
}
