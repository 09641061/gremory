# Contrato De Permisos Y API

Contrato vigente para permisos, roles e invitados. Describe qué permisos existen, qué significa
cada uno, qué envía el frontend y qué responde el backend.

## 1. Permisos asignables

Solo estos 10 permisos pueden otorgarse a un rol (invitado o miembro). El backend los valida y los
aplica de verdad. `GET /api/workforce/roles/permissions` devuelve exactamente esta lista, en este
orden:

| Permiso | Qué representa | Regla |
| --- | --- | --- |
| `scheduling:read` | Ver la agenda y poder ser asignado como empleado de un appointment | `scheduling:manage` también lo otorga |
| `scheduling:manage` | Crear, editar, cancelar, completar y eliminar appointments; administrar disponibilidad | Incluye `scheduling:read` |
| `catalog:read` | Ver servicios y categorías | `catalog:manage` también lo otorga |
| `catalog:manage` | Crear, editar y eliminar servicios y categorías | Incluye `catalog:read` |
| `crm:read` | Ver clientes | `crm:manage` también lo otorga |
| `crm:manage` | Crear, editar y eliminar clientes | Incluye `crm:read` |
| `workforce:read` | Ver el Team (roster) y los roles de la organización | `workforce:manage` también lo otorga |
| `workforce:manage` | Invitar, revocar invitaciones, remover miembros y administrar roles (crear/editar/eliminar/asignar) | Incluye `workforce:read` |
| `analytics:read` | Ver el módulo de Analytics | — |
| `establishment:update` | Editar el perfil del establishment (nombre, foto, zona horaria) | — |

Agrupación sugerida para el frontend (en orden de presentación):

```text
Scheduling     scheduling:read · scheduling:manage
Catálogo       catalog:read · catalog:manage
CRM            crm:read · crm:manage
Equipo         workforce:read · workforce:manage
Analytics      analytics:read
Administración establishment:update
```

### Códigos no asignables

El editor de roles NO debe ofrecer estos códigos. Si llegan por API, el backend los rechaza.

| Código | Motivo de exclusión |
| --- | --- |
| `organization:read` | Derivado: se otorga automáticamente al tener cualquier permiso de un establishment |
| `organization:update` | Owner-only |
| `organization:create_establishment` | Owner-only |
| `organization:manage_billing` | Owner-only |
| `establishment:read` | Implícito por ser miembro activo |
| `establishment:delete` | Owner-only |
| `workforce:invite` | Decorativo: todo pasa por `workforce:manage` |
| `workforce:manage_members` | Decorativo: todo pasa por `workforce:manage` |
| `workforce:manage_roles` | Decorativo: todo pasa por `workforce:manage` |

## 2. Roles

| Rol | Permisos | Notas |
| --- | --- | --- |
| `Everyone` | ninguno | `systemRole: true`, inamovible, siempre presente en cada membership |
| `Worker` (default) | `establishment:read`, `workforce:read`, `scheduling:read`, `catalog:read`, `crm:read`, `analytics:read` | Rol inicial asignado a invitados |
| `Manager` (default) | `establishment:read`, `establishment:update`, `workforce:read`, `workforce:invite`, `workforce:manage_members`, `workforce:manage_roles`, `scheduling:read`, `scheduling:manage`, `catalog:read`, `catalog:manage`, `crm:read`, `crm:manage`, `analytics:read` | Rol inicial de administración |
| Personalizados | Subconjunto de los 9 asignables | Creados por el owner con `workforce:manage` |

> Los roles default pueden contener permisos legacy en la base (seeds V11/V13/V14). El backend solo
> aplica los 9 asignables; el resto se ignora en la práctica.

## 3. Reglas de composición

- **`manage` implica `read`**: si un rol tiene `scheduling:manage`, su portador puede leer agenda.
- **Everyone siempre suma**: los permisos efectivos = Everyone + roles asignados.
- **Owner no es un rol**: el owner se identifica por `isOwner: true` y, en el roster, el backend
  inyecta un rol semántico `Owner` (`systemRole: true`, sin permisos) que no existe en `workforce_roles`
  ni puede asignarse.
- **La disponibilidad no es un permiso**: es un dato de Scheduling por `(user, establishment)`.

## 4. Contratos de API (roles y permisos)

Todas las peticiones llevan `Authorization: Bearer <token>` y, cuando la operación es de
organización, el header `X-Organization-Id: <uuid>`.

### GET `/api/workforce/roles/permissions`

- Envía: nada (solo auth).
- Responde `200` con el listado asignable, en orden:

```json
[
  "scheduling:read",
  "scheduling:manage",
  "catalog:read",
  "catalog:manage",
  "crm:read",
  "crm:manage",
  "workforce:read",
  "workforce:manage",
  "analytics:read",
  "establishment:update"
]
```

### GET `/api/workforce/roles?page=0&size=20`

- Envía: `X-Organization-Id` (opcional; si falta se resuelve la org del owner).
- Responde `200` con `Page<WorkforceRoleResponse>`:

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Catalog manager",
      "permissions": ["catalog:read", "catalog:manage"],
      "systemRole": false,
      "position": 2
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1
}
```

- Requiere `workforce:read` en la organización objetivo.

### POST `/api/workforce/roles`

- Envía:

```json
{ "name": "Catalog manager", "position": 2 }
```

- `position` es opcional (si se omite, se agrega al final).
- Responde `201` con `WorkforceRoleResponse` (permisos vacíos al crear).
- Requiere `workforce:manage`.

### PATCH `/api/workforce/roles/{roleId}`

- Envía al menos un campo:

```json
{ "name": "Catalog admin", "permissions": ["catalog:manage"], "position": 1 }
```

- `permissions` debe ser subconjunto de los 9 asignables; si no, `400/IllegalArgumentException`.
- Responde `200` con `WorkforceRoleResponse` actualizado.
- Requiere `workforce:manage`. `Everyone` no se puede modificar (`409`).

### DELETE `/api/workforce/roles/{roleId}`

- Responde `204`. `Everyone` no se puede eliminar (`409`).
- Requiere `workforce:manage`.

### PUT `/api/workforce/roles/members/{memberId}`

- Envía:

```json
{ "roleId": "uuid" }
```

- Asigna un rol a un miembro activo. Responde `204`.
- Requiere `workforce:manage`.

### DELETE `/api/workforce/roles/members/{memberId}/{roleId}`

- Quita un rol asignado. Responde `204`. `Everyone` no se puede quitar (`409`).
- Requiere `workforce:manage`.

## 5. Contratos de API (roster)

### GET `/api/workforce/members?establishmentId={uuid}&page=0&size=20`

- Envía: `X-Organization-Id` + `establishmentId` opcional.
- Requiere `workforce:read` en la organización.
- Responde `200` con `Page<WorkforceUserResponse>`:

```json
{
  "content": [
    {
      "invitationId": "uuid",
      "memberId": "uuid",
      "userId": "uuid",
      "email": "employee@example.com",
      "username": "Juan",
      "imageUrl": null,
      "organizationId": "uuid",
      "organizationName": "Takodu Studio",
      "establishmentId": "uuid",
      "establishmentName": "Miraflores",
      "status": "ACTIVE",
      "roles": [
        {
          "id": "uuid",
          "name": "Everyone",
          "position": 1,
          "systemRole": true,
          "permissions": []
        },
        {
          "id": "uuid",
          "name": "Worker",
          "position": 2,
          "systemRole": false,
          "permissions": ["establishment:read", "scheduling:read", "catalog:read", "crm:read"]
        }
      ],
      "invitedAt": "2026-08-01T10:00:00Z",
      "invitationExpiresAt": "2026-08-08T10:00:00Z",
      "acceptedAt": "2026-08-02T09:00:00Z",
      "joinedAt": "2026-08-02T09:00:00Z",
      "removedAt": null,
      "isOwner": false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1
}
```

- Cuando `isOwner: true`, `roles` incluye el rol semántico `Owner` como primer elemento
  (`systemRole: true`, sin permisos) para que cualquier viewer lo vea igual.
- `status` puede ser `PENDING`, `ACTIVE`, `REMOVED` o `EXPIRED`.
- El frontend debe renderizar un chip "Owner" cuando `isOwner: true` y tratar todo rol
  `systemRole: true` como de solo lectura.

### GET `/api/workforce/members/me?establishmentId={uuid}`

- Envía: `X-Organization-Id` + `establishmentId` opcional.
- Requiere `workforce:read`.
- Responde `200` con `WorkforceSelfMembershipResponse`:

```json
{
  "memberId": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "organizationName": "Takodu Studio",
  "establishmentId": "uuid",
  "establishmentName": "Miraflores",
  "status": "ACTIVE",
  "roles": [
    {
      "id": "uuid",
      "name": "Everyone",
      "position": 1,
      "systemRole": true,
      "permissions": []
    }
  ],
  "username": "Juan",
  "imageUrl": null,
  "email": "employee@example.com",
  "isOwner": false
}
```

- Si el usuario es owner, `roles` también incluye el rol semántico `Owner`.

## 6. Errores comunes

| Código | Causa |
| --- | --- |
| `400` | Payload inválido o `permissions` contiene códigos no asignables |
| `401` | Token ausente o inválido |
| `403` | Falta `workforce:read` / `workforce:manage` o el usuario no es miembro activo |
| `404` | Rol, miembro u organización no encontrados |
| `409` | Nombre de rol duplicado, o se intenta modificar/eliminar/quitar `Everyone` |