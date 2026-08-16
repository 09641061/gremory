# Workforce Frontend Access Contract

Este documento define como debe consumir el frontend el acceso de workforce.
La idea principal es simple:

- el backend resuelve la autorizacion
- el frontend solo renderiza con base en capacidades ya calculadas
- el frontend no debe inferir permisos por el nombre del rol

Este contrato complementa a `business-workspace-frontend-contract.md` y se
aplica al acceso de equipo y modulos del establecimiento activo.

## Objetivo

El frontend debe usar este contrato para:

- mostrar u ocultar navegacion
- habilitar o deshabilitar botones
- decidir si una pantalla es accesible
- renderizar acciones segun el establecimiento activo

## Fuentes de verdad

### 1. Workspace activo

El workspace del usuario indica que establecimiento esta activo.
El frontend debe tomar ese contexto desde `GET /api/business/workspace`.

Campos relevantes:

- `activeEstablishmentId`
- `establishments`
- `authorization`
- `accessPolicy`

### 2. Acceso workforce

El endpoint `GET /api/workforce/access` devuelve el acceso real del usuario en workforce.

Ese endpoint devuelve:

- `active`
- `establishments`
- `membershipCapabilities`

## Regla principal

El frontend debe cruzar ambos contratos:

1. obtener el local activo desde `business/workspace`
2. buscar ese `establishmentId` dentro de `workforce/access.establishments`
3. usar `membershipCapabilities` de ese establecimiento

No se deben mezclar capacidades de varios locales.
No se deben deducir permisos por el nombre del rol.
No se deben usar datos de billing para habilitar o bloquear workforce.

## Forma del contrato

### `GET /api/workforce/access`

La respuesta tiene esta forma:

```json
{
  "active": true,
  "establishments": [
    {
      "organizationId": "22222222-2222-4222-8222-222222222222",
      "organizationName": "Takodu Studio",
      "establishmentId": "33333333-3333-4333-8333-333333333333",
      "establishmentName": "Miraflores",
      "roles": [
        {
          "id": "44444444-4444-4444-8444-444444444444",
          "name": "Manager",
          "position": 1,
          "systemRole": false
        }
      ],
      "membershipCapabilities": {
        "canReadTeam": true,
        "canCreateInvitation": true,
        "canDeleteInvitation": false,
        "canUpdateRole": false,
        "canDeleteRole": false,
        "canEditEstablishmentProfile": false,
        "canOpenModules": true,
        "canReadAnalytics": true,
        "canReadAppointments": true,
        "canCreateAppointment": true,
        "canUpdateAppointment": true,
        "canDeleteAppointment": true
      },
      "effectivePermissions": [
        "workforce:read",
        "workforce:invite",
        "workforce:manage_members",
        "scheduling:read",
        "scheduling:manage",
        "crm:read",
        "crm:manage",
        "catalog:read",
        "catalog:manage",
        "analytics:read"
      ]
    }
  ],
  "membershipCapabilities": {
    "canReadTeam": true,
    "canCreateInvitation": true,
    "canDeleteInvitation": false,
    "canUpdateRole": false,
    "canDeleteRole": false,
    "canEditEstablishmentProfile": false,
    "canOpenModules": true,
    "canReadAnalytics": true,
    "canReadAppointments": true,
    "canCreateAppointment": true,
    "canUpdateAppointment": true,
    "canDeleteAppointment": true
  }
}
```

## Significado de `active`

`active` indica si el usuario tiene al menos un establecimiento accesible.

- `true`: el usuario tiene acceso workforce activo
- `false`: el usuario no tiene acceso workforce utilizable

## Significado de `establishments`

Cada item representa un establecimiento al que el usuario tiene acceso.

El frontend puede usar esa lista para:

- mostrar selector de local si aplica
- cruzar el local activo
- depurar o mostrar roles asignados

## Significado de `membershipCapabilities`

`membershipCapabilities` es el bloque que el frontend debe usar para decisiones de UI.

### Capacidades de workforce

- `canReadTeam`
  - muestra la pantalla de equipo o roster
  - permite entrar a miembros e invitaciones

- `canCreateInvitation`
  - muestra el boton de invitar
  - permite abrir el modal o flujo de invitacion

- `canDeleteInvitation`
  - permite revocar o cancelar invitaciones pendientes

- `canUpdateRole`
  - permite editar el rol de un miembro
  - permite cambiar asignaciones de rol

- `canDeleteRole`
  - permite eliminar un rol custom

- `canEditEstablishmentProfile`
  - permite editar nombre, imagen o datos del local

- `canOpenModules`
  - permite navegar a modulos internos del establecimiento
  - sirve como flag general de acceso operativo

## Billing y workflow

Billing no forma parte de esta capa de autorizacion.

Reglas:

- no usar `subscription.active` para decidir workforce
- no llamar mutaciones de billing desde la pagina de workforce
- si una pantalla de workforce necesita mostrar plan o upgrade, debe hacerlo como informacion secundaria y no como gate

### Capacidades de agenda

- `canReadAnalytics`
  - permite ver analytics

- `canReadAppointments`
  - permite entrar a agenda

- `canCreateAppointment`
  - permite crear citas

- `canUpdateAppointment`
  - permite editar citas

- `canDeleteAppointment`
  - permite borrar citas

## Reglas de UI recomendadas

### Navegacion

- si `canOpenModules` es `false`, no mostrar modulos internos
- si `canReadTeam` es `false`, ocultar equipo y roles
- si `canReadAnalytics` es `false`, ocultar analytics
- si `canReadAppointments` es `false`, ocultar agenda

### Acciones

- si `canCreateInvitation` es `false`, ocultar boton de invitar
- si `canDeleteInvitation` es `false`, ocultar boton de revocar
- si `canUpdateRole` es `false`, deshabilitar edicion de roles
- si `canDeleteRole` es `false`, deshabilitar borrado de roles
- si `canEditEstablishmentProfile` es `false`, deshabilitar edicion del perfil

## Roles base del backend

El backend puede devolver roles base como:

- `Everyone`
- `Manager`
- `Worker`

El frontend puede mostrarlos, pero no debe usar el nombre para decidir permisos.

Ejemplo:

- no asumir que `Manager` siempre puede editar el perfil
- no asumir que `Worker` nunca puede ver analytics
- no asumir que el nombre del rol es suficiente para autorizar

## Permisos crudos

`effectivePermissions` sigue siendo util como dato tecnico.

Sirve para:

- debug
- trazabilidad
- mostrar permisos en una pantalla avanzada
- ayudar a soporte o administracion

No debe ser la fuente primaria para navegación o acciones.

## Permisos workforce soportados hoy

El backend puede reconocer estos permisos:

- `workforce:read`
- `workforce:invite`
- `workforce:manage_members`
- `workforce:manage_roles`
- `workforce:manage`

Regla recomendada:

- `workforce:manage` queda como compatibilidad amplia
- los permisos finos deben usarse para el comportamiento real

## Ejemplo de uso en frontend

### 1. Carga inicial

```ts
const workspace = await api.getBusinessWorkspace();
const access = await api.getWorkforceAccess();
```

### 2. Resolver el local activo

```ts
const activeEstablishmentId = workspace.activeEstablishmentId;
const activeAccess = access.establishments.find(
  (item) => item.establishmentId === activeEstablishmentId
);
```

### 3. Obtener capacidades

```ts
const caps = activeAccess?.membershipCapabilities;
```

### 4. Render condicional

```ts
if (!caps?.canReadTeam) {
  return null;
}

return (
  <div>
    <TeamHeader />
    {caps.canCreateInvitation && <InviteButton />}
    {caps.canUpdateRole && <RoleEditor />}
    {caps.canEditEstablishmentProfile && <EditEstablishmentButton />}
  </div>
);
```

## Ejemplo de mapeo visual

| Capability | UI |
|---|---|
| `canReadTeam` | Mostrar menu Equipo |
| `canCreateInvitation` | Mostrar boton Invitar |
| `canDeleteInvitation` | Mostrar accion Revocar |
| `canUpdateRole` | Mostrar editor de roles |
| `canDeleteRole` | Mostrar boton Eliminar rol |
| `canEditEstablishmentProfile` | Mostrar seccion de perfil del local |
| `canOpenModules` | Permitir navegacion operativa |
| `canReadAnalytics` | Mostrar analytics |
| `canReadAppointments` | Mostrar agenda |

## Ejemplo completo de escenarios

### Scenario A: Owner

- puede ver todo
- puede invitar
- puede editar establecimiento
- puede administrar roles

### Scenario B: Manager

- puede ver equipo
- puede invitar workers
- puede administrar miembros
- no deberia editar el perfil del local por defecto

### Scenario C: Worker

- puede entrar al local
- puede usar modulos asignados
- no puede invitar
- no puede administrar roles
- no puede editar el perfil del local

## Antipatrones

- decidir por `role.name`
- decidir por el orden del array de roles
- mezclar capacidades de varios establecimientos
- usar `effectivePermissions` como unica fuente de verdad
- asumir que `Manager` significa siempre lo mismo en todos los negocios

## Resumen operativo

El frontend debe seguir esta regla:

> `business/workspace` define el contexto activo
> `workforce/access` define las capacidades de ese contexto
> la UI solo refleja lo que el backend ya resolvio
