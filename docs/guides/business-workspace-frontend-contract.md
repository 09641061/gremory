# Business Workspace Frontend Contract

Este documento resume el contrato que el frontend debe consumir para resolver acceso, navegacion y contexto del workspace.

Para el acceso de equipo y modulos del establecimiento activo, ver
[frontend-access-contract.md](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/docs/guides/frontend-access-contract.md).

## Fuente de verdad

`GET /api/business/workspace`

El frontend debe tratar este endpoint como la fuente principal de verdad para:

- shell
- sidebar
- tabs
- rutas protegidas
- empty states de navegacion
- botones principales de accion

## Regla general

El frontend no debe:

- inferir permisos por intuicion de rol
- asumir que `OWNER` implica acceso total
- convertir un campo ausente en `true`
- duplicar reglas distintas en sidebar, pagina y componentes
- decidir autorizacion usando solo `accountType`

## Modelo de acceso

El contrato expone dos capas complementarias:

- `authorization`
  - modelo semantico de rol, scope y capacidades
- `accessPolicy`
  - resolucion final para shell, navegacion y modulos

La capa semantica describe el negocio.
La capa de policy sigue siendo util para UI y entrada a modulos.

## Payload esperado

```json
{
  "accountType": "OWNER | MEMBER | PENDING_INVITATION",
  "onboardingStatus": "ORGANIZATION_PENDING | ESTABLISHMENT_PENDING | COMPLETED",
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
  "authorization": {
    "role": "OWNER",
    "scope": {
      "type": "ORGANIZATION",
      "id": "uuid",
      "name": "Takodu Studio"
    },
    "capabilities": {
      "canEditOrganizationProfile": true,
      "canEditEstablishmentProfile": true,
      "canManageMembers": true,
      "canManageBilling": true,
      "canOpenModules": true,
      "canInviteUsers": true
    }
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

## Uso recomendado

- `authorization.role`
  - sirve para etiquetas humanas y decisiones de UX
- `authorization.scope`
  - sirve para saber si el rol aplica a la organizacion o al establecimiento
- `authorization.capabilities`
  - sirve para acciones de negocio que el frontend quiera mostrar o esconder
- `accessPolicy`
  - sirve para sidebar, tabs, rutas y navegacion de modulos
- `subscription`
  - sirve para billing y limites del plan
  - no debe decidir onboarding, shell o permisos generales
  - si falta o falla, la UI sigue funcionando con `business/workspace`
- `accountType`
  - sirve para UX general, no para autorizar

## Reglas duras

- `PENDING_INVITATION` debe resolver todo en `false`
- si un flag no viene, el frontend debe denegar por defecto
- `OWNER` no significa acceso total automatico en la UI
- `subscription` no debe usarse para decidir navegacion general
- `subscription` solo enriquece pantallas explicitas de billing
- `ownedOrganizationId` sirve para distinguir ownership real de contexto activo

## Caso recomendado para analytics

Orden recomendado:

1. Si `accountType == PENDING_INVITATION`, no entra.
2. Si `accessPolicy.canOpenAnalytics == true`, mostrar la ruta.
3. Si la pantalla necesita detalle fino, usar `GET /api/workforce/access`.
4. Si no viene ninguna senal valida, denegar.

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
- `subscription` no debe gatillar onboarding, shell o home.
- `subscription` solo debe leerse en pantallas explicitas de billing o plan.

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
