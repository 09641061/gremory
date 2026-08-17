# Contrato de API - Business Workspace

Este es el contrato canonico que el frontend debe consumir para resolver el estado de acceso del usuario en la app.

## Endpoint

`GET /api/business/workspace`

## Objetivo

Este endpoint es la fuente principal de verdad para el shell del frontend.
El frontend no debe:

- inferir permisos por intuicion de rol
- asumir que `OWNER` implica acceso total en todas las pantallas
- convertir `undefined` o campo faltante en `true`
- decidir reglas distintas en sidebar, pagina y componentes

El backend resuelve el contexto y devuelve flags ya normalizados para que el frontend solo consuma.

## Regla de uso

El frontend debe leer este endpoint una sola vez al arrancar el shell y construir una policy unica de navegacion y acceso.

Orden recomendado de resolucion:

1. `business/workspace` como fuente primaria
2. `workforce/access` como fuente complementaria para detalle de membresia
3. `billing` solo para vistas de plan o facturacion, no para inferir navegacion
4. `analytics/free` solo como endpoint de datos, no como fuente de autorizacion de UI

## Respuesta

Forma general del payload:

```json
{
  "accountType": "OWNER",
  "onboardingStatus": "COMPLETED",
  "onboardingCompleted": true,
  "organization": {
    "id": "uuid",
    "name": "Takodu Studio",
    "imageUrl": "https://...",
    "permissions": {
      "canRead": true,
      "canUpdate": true,
      "canCreateEstablishment": true
    }
  },
  "establishments": [
    {
      "id": "uuid",
      "name": "Main location",
      "photoUrl": "https://...",
      "effectivePermissions": ["analytics:read", "scheduling:read"],
      "permissions": {
        "canRead": true,
        "canUpdate": true,
        "canDelete": true
      },
      "organizationId": "uuid",
      "organizationName": "Takodu Studio",
      "organizationImageUrl": "https://..."
    }
  ],
  "activeEstablishmentId": "uuid",
  "subscription": {
    "active": true,
    "planName": "Free",
    "status": "ACTIVE",
    "canManageBilling": true
  },
  "pendingInvitation": null,
  "ownershipCapabilities": {
    "canReadAnalytics": true,
    "canReadAppointments": true,
    "canCreateAppointment": true,
    "canUpdateAppointment": true,
    "canDeleteAppointment": true
  },
  "planCapabilities": {
    "canCreateEstablishment": true,
    "canUseAssistant": true
  },
  "accessPolicy": {
    "canOpenAnalytics": true,
    "canOpenScheduling": true,
    "canOpenCrm": true,
    "canOpenCatalog": true,
    "canOpenTeam": true,
    "canUseAssistant": true,
    "canCreateEstablishment": true,
    "canManageBilling": true
  },
  "ownedOrganizationId": "uuid"
}
```

## `accessPolicy`

`accessPolicy` es el bloque que el shell debe usar para decidir:

- sidebar
- tabs
- rutas protegidas
- empty states de navegacion
- botones de accion de primer nivel

Campos:

- `canOpenAnalytics`
- `canOpenScheduling`
- `canOpenCrm`
- `canOpenCatalog`
- `canOpenTeam`
- `canUseAssistant`
- `canCreateEstablishment`
- `canManageBilling`

## Significado de cada campo

- `canOpenAnalytics`:
  - habilita la entrada al modulo analytics
- `canOpenScheduling`:
  - habilita la entrada al modulo scheduling
- `canOpenCrm`:
  - habilita la entrada al modulo crm
- `canOpenCatalog`:
  - habilita la entrada al modulo catalog
- `canOpenTeam`:
  - habilita la entrada al modulo team/workforce
- `canUseAssistant`:
  - habilita assistant y su landing inicial
  - si falta temporalmente, el frontend debe denegar por defecto
- `canCreateEstablishment`:
  - habilita la accion de crear locales
- `canManageBilling`:
  - habilita acciones de billing en pantallas explicitamente de billing

## Reglas de resolucion

- `PENDING_INVITATION` siempre debe resolver todo en `false`.
- El backend no debe exigir al frontend que infiera `owner` por rol.
- Si una capability viene presente, ese valor manda.
- Si una capability no viene en un futuro contrato, el frontend no debe inventar `true`.
- Si falta un flag temporalmente por compatibilidad, el frontend puede usar un fallback transitorio solo mientras el backend termina de emitirlo.

## Fuente de verdad por dominio

- `ownershipCapabilities`:
  - permisos funcionales de ownership o membresia efectiva
  - ejemplo: `analytics`, `scheduling`, acciones de modulo
- `planCapabilities`:
  - features del plan
  - ejemplo: `assistant`, limite de establecimientos
- `accessPolicy`:
  - resolucion final para shell y navegacion
  - este es el contrato que debe usar el frontend para abrir o cerrar modulos
  - incluye assistant, billing y creacion de establecimientos como flags ya normalizados

## Regla recomendada para analytics

Analytics debe resolverse asi:

1. Si `accountType == PENDING_INVITATION`, no entra.
2. Si `accessPolicy.canOpenAnalytics == true`, el frontend puede mostrar la ruta.
3. Si el backend expone `ownershipCapabilities.canReadAnalytics`, usar ese valor para compatibilidad con partes viejas del frontend.
4. Si el frontend tambien consume `workforce/access`, puede usar `membershipCapabilities.canReadAnalytics` como respaldo.
5. Si no viene nada, denegar.

La idea importante es:

- `owner` no se infiere en la pagina
- `owner` se resuelve en el shell o en `business/workspace`
- la pagina solo consume el permiso ya resuelto

## Regla recomendada para assistant

Assistant debe resolverse asi:

1. Si `accountType == PENDING_INVITATION`, no entra.
2. Si `accessPolicy.canUseAssistant == true`, el frontend puede mostrar `/chat`.
3. Si el backend aun no emite `canUseAssistant`, denegar por defecto.
4. Si no viene nada, denegar.

La idea importante es:

- `assistant` no se infiere por plan ni por rol en cada pagina
- `assistant` se resuelve en el shell o en `business/workspace`
- el landing inicial y la pagina solo consumen el permiso ya resuelto

## Reglas de frontend

- El sidebar, las rutas y las paginas deben consumir la misma policy.
- No conviene que cada modulo calcule acceso por su cuenta.
- `effectivePermissions` puede seguir existiendo para inspeccion o debugging, pero no debe ser la fuente primaria si `accessPolicy` ya esta disponible.
- `accountType` sirve para layout y UX, no para autorizacion.
- `subscription` sirve para billing y plan, no para decidir por si solo acceso a modulos.
- `subscription` no debe influir en onboarding ni en la entrada general a la app.
- las mutaciones de billing solo deben ejecutarse desde pantallas explicitas de billing y solo cuando el usuario sea owner.

## Casos de uso

- Owner con organizacion y establecimientos:
  - `accessPolicy` puede habilitar analytics, scheduling, crm, catalog y team segun contexto
- Member con permisos efectivos:
  - `accessPolicy` puede habilitar modulos sin necesidad de asumir ownership
- Pending invitation:
  - `accessPolicy` debe venir todo en `false`
- Owner sin establecimientos aun:
  - puede seguir viendo onboarding y crear el primer establecimiento
  - el resto de modulos debe quedar cerrado hasta tener contexto operativo

## Contratos relacionados

- `GET /api/workforce/access`
  - detalle de membresia y permisos efectivos
- `GET /api/analytics/free`
  - snapshot de datos del modulo analytics
  - no debe usarse para inventar permisos de UI
- `GET /api/billing/subscriptions`
  - datos complementarios del plan actual
  - no debe usarse para decidir onboarding, shell o permisos generales

## Nota final

Este contrato esta pensado para que frontend tenga una sola capa de resolucion de acceso.
Si el backend ya expone `accessPolicy`, esa debe tener prioridad sobre cualquier inferencia local.
