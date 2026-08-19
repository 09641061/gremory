# Frontend v1: Permisos, Roles y Workspace

Este documento describe el estado actual del frontend y las decisiones que deben
preservarse al integrar cambios desde `develop` o modificar contratos del backend.
No es solo una lista de permisos: explica por qué existen las separaciones actuales
y qué fuente debe usarse para cada decisión.

## Objetivo

El frontend debe distinguir cuatro cosas diferentes:

1. La organización que el usuario puede seleccionar.
2. El contexto de workspace actualmente seleccionado.
3. Los permisos directos sobre una organización o establishment.
4. Los permisos de módulos y acciones derivados de roles.

La regla general es no inferir permisos desde el rol. El rol sirve para mostrar
información contextual; las acciones siempre se habilitan mediante permisos
concretos.

## Fuentes de Verdad

| Necesidad | Fuente | Uso |
| --- | --- | --- |
| Selector de organizaciones | `GET /api/business/organizations/accessible` | Lista todas las organizaciones accesibles, incluso sin establishments visibles |
| Contexto seleccionado | `GET /api/business/workspace?organizationId=<id>` | Organización activa, establishments y permisos actuales |
| Roster de Team | `GET /api/workforce/members?establishmentId=<id>` | Miembros, roles, memberships e `isOwner` |
| Acceso derivado de memberships | `GET /api/workforce/access` | Permisos derivados de usuarios invitados; no identifica ownership automáticamente |
| Empleados para citas | `GET /api/scheduling/appointments/employees?establishmentId=<id>` | Identidad, `userId`, `isOwner` y disponibilidad para Scheduling |
| Roles | `GET /api/workforce/roles?organizationId=<id>` | Roles de Workforce de la organización seleccionada |
| Catálogo de permisos | `GET /api/workforce/roles/permissions` | Permisos que pueden ser conocidos por el frontend |

El frontend no debe reconstruir organizaciones agrupando
`workspace.establishments`. El selector utiliza directamente el endpoint

## Workspace

La respuesta del workspace contiene, como mínimo:

```json
{
  "accountType": "OWNER | MEMBER | PENDING_INVITATION",
  "onboardingStatus": "ORGANIZATION_PENDING | ESTABLISHMENT_PENDING | COMPLETED",
  "organization": {
    "id": "org-id",
    "name": "Organization",
    "permissions": {
      "canRead": true,
      "canUpdate": true,
      "canCreateEstablishment": true
    }
  },
  "establishments": [
    {
      "id": "est-id",
      "organizationId": "org-id",
      "permissions": {
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "effectivePermissions": [
        "establishment:read",
        "establishment:update",
        "establishment:delete",
        "scheduling:read",
        "scheduling:manage",
        "catalog:read",
        "catalog:manage",
        "crm:read",
        "crm:manage",
        "analytics:read",
        "workforce:read",
        "workforce:invite",
        "workforce:manage_members",
        "workforce:manage_roles"
      ]
    }
  ],
  "activeEstablishmentId": "est-id",
  "subscription": {
    "active": true,
    "planName": "Free",
    "status": "ACTIVE",
    "canManageBilling": true
  },
  "authorization": {
    "role": "OWNER",
    "scope": {
      "type": "ORGANIZATION",
      "id": "org-id",
      "name": "Organization"
    }
  },
  "accessPolicy": {
    "canOpenAnalytics": true,
    "canOpenScheduling": true,
    "canOpenCrm": true,
    "canOpenCatalog": true,
    "canOpenTeam": true,
    "canUseAssistant": false,
    "canCreateEstablishment": true,
    "canManageBilling": true
  },
  "ownedOrganizationId": "org-id"
}
```

## Por Qué Se Separan los Permisos

### Organización

Estos permisos describen el perfil global de la organización y no deben ser
concedidos por un rol de Workforce asignado a un establishment:

```text
organization:read
organization:update
organization:create_establishment
organization:manage_billing
```

El frontend usa:

```ts
workspace.organization?.permissions.canRead === true;
workspace.organization?.permissions.canUpdate === true;
workspace.organization?.permissions.canCreateEstablishment === true;
```

Esto evita que un Manager o Worker invitado pueda editar el nombre, logo o
configuración global de una organización ajena.

### Establishment

Estos permisos aplican únicamente al establishment al que el usuario tiene
acceso:

```text
establishment:read
establishment:update
establishment:delete
```

Además, el workspace entrega permisos directos:

```ts
establishment.permissions.canRead;
establishment.permissions.canUpdate;
establishment.permissions.canDelete;
```

`establishment:delete` existe en el contrato backend, pero no aparece como
switch asignable en el editor de roles Workforce. La UI de delete solo se
muestra para un establishment de la organización propia cuando el workspace
devuelve `permissions.canDelete === true`.

### Módulos y acciones

Los permisos funcionales se asignan a roles de Workforce en scope de
establishment:

```text
scheduling:read
scheduling:manage
catalog:read
catalog:manage
crm:read
crm:manage
analytics:read
workforce:read
workforce:invite
workforce:manage_members
workforce:manage_roles
workforce:manage
```

## Navegación de Módulos

`accessPolicy` decide si el usuario puede entrar al módulo:

```ts
const canOpenScheduling = workspace.accessPolicy?.canOpenScheduling === true;
const canOpenCatalog = workspace.accessPolicy?.canOpenCatalog === true;
const canOpenCrm = workspace.accessPolicy?.canOpenCrm === true;
const canOpenTeam = workspace.accessPolicy?.canOpenTeam === true;
const canOpenAnalytics = workspace.accessPolicy?.canOpenAnalytics === true;
```

No utilizar para esto:

```ts
workspace.accountType === "OWNER";
workspace.authorization?.role === "OWNER";
workspace.authorization?.capabilities.canOpenScheduling;
```

`effectivePermissions` controla acciones internas, no reemplaza

## Roles

### Worker

Permisos esperados:

```text
establishment:read
scheduling:read
catalog:read
crm:read
analytics:read
workforce:read
```

Puede consultar el negocio y el Team, pero no puede editar establishments,
crear citas, modificar catálogo, modificar CRM, invitar usuarios, administrar
miembros ni modificar roles.

### Manager

Permisos esperados:

```text
establishment:read
establishment:update
scheduling:read
scheduling:manage
catalog:read
catalog:manage
crm:read
crm:manage
analytics:read
workforce:read
workforce:invite
workforce:manage_members
workforce:manage_roles
```

Puede operar el establishment y administrar el Team, pero no obtiene por eso
permisos globales sobre la organización.

### Owner

El owner no es un Workforce Role asignable. Se identifica mediante:

```ts
workspace.authorization?.role === "OWNER";
```

Esto solo sirve para contexto y presentación. Las acciones siguen dependiendo
de permisos concretos y del estado de suscripción.

## Everyone e isOwner

`Everyone` es un rol técnico heredado:

```json
{
  "name": "Everyone",
  "systemRole": true,
  "permissions": []
}
```

La UI lo trata como ausencia de rol funcional:

- No aparece como rol administrable en `/permissions`.
- Si es el único rol, Team muestra `No role assigned`.
- Si existe junto con Worker o Manager, solo se muestran los roles funcionales.

El owner se representa separadamente:

```json
{
  "isOwner": true
}
```

Si `member.isOwner === true`, Team muestra `OWNER` y no muestra el dropdown de
roles para esa fila. El owner tampoco aparece como miembro disponible para
asignar roles.

## Scheduling y Disponibilidad

La disponibilidad es responsabilidad de Scheduling, no de Business ni de
Workforce:

```http
GET /api/scheduling/appointments/employees?establishmentId=<id>
```

Respuesta:

```json
[
  {
    "userId": "user-id",
    "name": "Owner",
    "imageUrl": null,
    "isOwner": true,
    "availableForScheduling": true
  }
]
```

El frontend usa `userId` como `employeeId`, nunca `memberId`.

Los empleados no disponibles permanecen visibles, pero deshabilitados en el
selector de appointments.

La actualización usa:

```http
PUT /api/scheduling/appointments/employees/{userId}/availability?establishmentId=<id>&available=true
```

En Team, el estado se muestra como `Available for appointments` o

## Appointments

Crear una cita requiere:

```ts
establishment.permissions.canRead === true;
establishment.effectivePermissions.includes("scheduling:manage");
```

Payload:

```json
{
  "title": "Appointment",
  "startsAt": "2026-08-17T10:00:00-05:00",
  "endsAt": "2026-08-17T11:00:00-05:00",
  "serviceId": "service-id",
  "customerId": "customer-id",
  "employeeId": "employee-user-id",
  "establishmentId": "establishment-id"
}
```

El creador necesita `scheduling:manage`. El empleado asignado debe tener
validación final.

## Suscripción

Un plan Free activo permite los permisos normales del owner. Si la suscripción
está inactiva y el owner puede administrar billing, el bloqueo de módulos debe
llevar a `/upgrade`, no directamente a `/access-denied`.

La suscripción condiciona el acceso operativo, pero no cambia el significado de
los roles ni de los permisos.

## Autenticación y Sesiones

Los permisos no están dentro del JWT. Un cambio de permisos no requiere
invalidar tokens.

Los tokens sí son rotativos:

- `401`: intentar refresh.
- Guardar el nuevo `accessToken` y el nuevo `refreshToken`.
- Si el refresh falla, limpiar sesión y volver a `/login`.

`Invalid access token` y `Invalid refresh token` son errores de sesión, no de
permisos.

## Reglas para Merge con develop

Antes de aceptar cambios de otra rama:

- No reintroducir `business:read` ni `business:manage`.
- No reconstruir organizaciones desde `workspace.establishments`.
- No usar `authorization.role` como permiso.
- No usar `memberId` como `employeeId`.
- No volver a colocar disponibilidad en Establishment.
- No mostrar `Everyone` como rol funcional.
- No permitir asignar roles al owner.
- No mostrar `establishment:delete` como switch de Workforce.
- Mantener `organization.permissions` separado de `effectivePermissions`.
- Mantener `accessPolicy` como fuente de entrada a módulos.
- Ejecutar `npm test`, `npm run lint` y `npx tsc --noEmit`.

## Estado

Este documento representa el contrato frontend v1 y debe actualizarse si cambia
alguna fuente de verdad, permiso, rol, endpoint o regla de navegación.
