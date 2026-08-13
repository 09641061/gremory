# Workforce permissions

Workforce exposes a role-based permission contract to the frontend. Every
protected resource has only two actions:

- `read`: opens and reads the resource.
- `manage`: creates, updates and deletes the resource. It also grants read access.

## Supported permissions

### Business

- `business:read`
- `business:manage`

### Catalog

- `catalog:read`
- `catalog:manage`

### CRM

- `crm:read`
- `crm:manage`

### Workforce

- `workforce:read`
- `workforce:manage`

### Scheduling

- `scheduling:read`
- `scheduling:manage`

## Frontend authorization

Permission codes are declared once in
`contexts/workforce/domain/model/enums/workforce-permission.ts`.

UI components must receive capability booleans such as `canReadTeam` or
`canUpdateCustomer`. They must not compare permission strings themselves.

The application shell includes a sidebar route only when the active
establishment grants the corresponding read or manage capability. The page
must independently verify the same capability on the server and redirect to
`/access-denied` when access is denied. Hiding a sidebar item is navigation
behavior, not the security boundary.

The organization owner has full access. Members receive access from their
effective role permissions for the selected establishment.
