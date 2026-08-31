# Contrato Frontend — Roles y Permisos (v2)

> **Cambio principal**: ya no existe el rol base `Everyone`. Al aceptar una invitación, el usuario
> recibe automáticamente el rol `Worker`. Todo rol es editable y borrable (salvo que esté asignado).
> El frontend ya no debe asumir ningún rol inyectado, excepto el `Owner` semántico.

## 1. Permisos asignables

`GET /api/workforce/roles/permissions` devuelve **exactamente** estos 10 códigos, en este orden
(orden de presentación en el editor):

```json
[
  "scheduling:read", "scheduling:manage",
  "catalog:read", "catalog:manage",
  "crm:read", "crm:manage",
  "workforce:read", "workforce:manage",
  "analytics:read",
  "establishment:update"
]
```

| Grupo | Códigos |
| --- | --- |
| Scheduling | `scheduling:read` · `scheduling:manage` |
| Catálogo | `catalog:read` · `catalog:manage` |
| CRM | `crm:read` · `crm:manage` |
| Equipo | `workforce:read` · `workforce:manage` |
| Analytics | `analytics:read` |
| Administración | `establishment:update` |

Reglas:

- `manage` **implica** `read` del mismo módulo (si asignas `scheduling:manage`, no hace falta
  `scheduling:read`).
- `establishment:update` solo habilita editar el perfil del establishment (nombre, foto, zona
  horaria). No crea/elimina establishments, no edita la organización, no abre módulos.
- No ofrecer en el editor (el backend los rechaza): `organization:*`, `establishment:delete`,
  `workforce:invite`, `workforce:manage_members`, `workforce:manage_roles`.

## 2. Roles

- **No existe rol base inamovible** (`Everyone` fue eliminado).
- **`Worker`** (default): se **auto-asigna** a todo usuario que acepta la invitación. Nace sin
  permisos. Es editable (`PATCH`): los cambios afectan a todos los portadores. Se puede quitar de un
  miembro.
- **`Manager`** (default): plantilla de administración, no se auto-asigna.
- **Personalizados**: subconjunto de los 10 asignables.
- Todos los roles son editables (`systemRole: false` en todos). **Borrar un rol requiere que nadie
  lo tenga asignado**, si no → `409`.
- El rol `Owner` solo existe como rol semántico en el roster (no asignable, no borrable, no aparece
  en `GET /roles`).

## 3. Flujo del invitado

1. Owner invita a un email → invitación `PENDING` (con expiración).
2. El invitado acepta → el membership queda `ACTIVE` **con rol `Worker` asignado** (sin permisos
   por defecto).
3. **Estado restringido**: si el miembro queda sin roles o sus roles no tienen permisos →
   `membershipCapabilities.canOpenModules=false` y todos los `accessPolicy.canOpen* = false`.
   Mostrar pantalla "Sin acceso aún / contacta a tu administrador".
4. Owner edita `Worker` (`PATCH /roles/{id}`) o asigna roles personalizados
   (`PUT /roles/members/{memberId}`).
5. Con un rol que tenga permisos, los módulos se habilitan.

## 4. API de roles

Todas las peticiones llevan `Authorization: Bearer <token>` y `X-Organization-Id: <uuid>`.

### GET `/api/workforce/roles?page=0&size=20` — requiere `workforce:read`

```json
{
  "content": [
    { "id": "uuid", "name": "Worker", "permissions": [], "systemRole": false, "position": 1 }
  ],
  "page": 0, "size": 20, "totalElements": 1
}
```

### POST `/api/workforce/roles` — requiere `workforce:manage`

```json
{ "name": "Catalog manager", "position": 2 }
```

`position` opcional (omitir = al final). Respuesta `201` con `WorkforceRoleResponse` (permisos
vacíos).

### PATCH `/api/workforce/roles/{roleId}` — requiere `workforce:manage`

```json
{ "name": "Catalog admin", "permissions": ["catalog:manage"], "position": 1 }
```

Al menos un campo. `permissions` debe ser subconjunto de los 10 asignables → si no, `400`.
Respuesta `200`.

### DELETE `/api/workforce/roles/{roleId}` — requiere `workforce:manage`

`204` si se borra. **`409` si el rol sigue asignado a miembros** → UI: "No se puede borrar un rol
asignado a miembros".

### PUT `/api/workforce/roles/members/{memberId}` — requiere `workforce:manage`

```json
{ "roleId": "uuid" }
```

Asigna un rol a un miembro `ACTIVE`. Respuesta `204`. Si el miembro no está activo o no existe →
`404`.

### DELETE `/api/workforce/roles/members/{memberId}/{roleId}` — requiere `workforce:manage`

`204` (idempotente). El miembro puede quedar **sin roles**.

## 5. Roster

### GET `/api/workforce/members?establishmentId={uuid}&page=0&size=20` — requiere `workforce:read`

```json
{
  "content": [
    {
      "invitationId": "uuid", "memberId": "uuid", "userId": "uuid",
      "email": "employee@example.com", "username": "Juan", "imageUrl": null,
      "organizationId": "uuid", "organizationName": "Takodu Studio",
      "establishmentId": "uuid", "establishmentName": "Miraflores",
      "status": "ACTIVE",
      "roles": [
        { "id": "uuid", "name": "Worker", "position": 1, "systemRole": false, "permissions": [] }
      ],
      "invitedAt": "...", "invitationExpiresAt": "...", "acceptedAt": "...", "joinedAt": "...",
      "removedAt": null,
      "isOwner": false
    }
  ],
  "page": 0, "size": 20, "totalElements": 1
}
```

Comportamiento que debes implementar:

- **`roles` vacío** = miembro `ACTIVE` sin rol → chip "**Sin rol**".
- **Owner**: `isOwner: true` y `roles` incluye un rol semántico `Owner` (`systemRole: true`, sin
  permisos). Chip "Owner" de solo lectura.
- Todo rol con `systemRole: true` = solo lectura (solo aplica al `Owner` semántico).
- `status`: `PENDING` | `ACTIVE` | `REMOVED` | `EXPIRED`. En `PENDING`/`EXPIRED` no hay
  `memberId`/`userId`.

### GET `/api/workforce/members/me?establishmentId={uuid}` — requiere `workforce:read`

```json
{
  "memberId": "uuid", "userId": "uuid",
  "organizationId": "uuid", "organizationName": "Takodu Studio",
  "establishmentId": "uuid", "establishmentName": "Miraflores",
  "status": "ACTIVE",
  "roles": [
    { "id": "uuid", "name": "Worker", "position": 1, "systemRole": false, "permissions": [] }
  ],
  "username": "Juan", "imageUrl": null, "email": "employee@example.com",
  "isOwner": false
}
```

Si `isOwner: true`, `roles` incluye el `Owner` semántico. Si `roles` está vacío → mostrar la
pantalla de "Sin acceso aún".

## 6. Errores comunes

| Código | Causa |
| --- | --- |
| `400` | Payload inválido o `permissions` con códigos no asignables |
| `401` | Token ausente o inválido |
| `403` | Falta `workforce:read` / `workforce:manage`, o no es miembro activo |
| `404` | Rol, miembro u organización no encontrados |
| `409` | Nombre de rol duplicado, o borrar un rol aún asignado a miembros |

## 7. Checklist para el editor de roles

- [ ] Todos los roles se muestran editables (no ocultar `Worker`).
- [ ] Botón "Borrar" deshabilitado con tooltip cuando el rol tenga miembros asignados (y manejar el
      `409` por si llega igual).
- [ ] Al quitar el último rol de un miembro, el roster lo muestra "Sin rol".
- [ ] El chip "Owner" se pinta cuando `isOwner: true`, independientemente de `roles`.
- [ ] No mostrar nunca `Everyone` ni ningún rol `systemRole` que no sea `Owner`.