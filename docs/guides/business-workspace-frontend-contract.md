# Business Workspace Frontend Contract

Este documento resume el contrato que el frontend debe consumir para resolver acceso, navegacion y contexto del workspace.

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
  - sirve para sidebar, tabs, rutas y navegación de módulos
- `subscription`
  - sirve para billing y limites del plan
- `accountType`
  - sirve para UX general, no para autorizar

## Reglas duras

- `PENDING_INVITATION` debe resolver todo en `false`
- si un flag no viene, el frontend debe denegar por defecto
- `OWNER` no significa acceso total automatico en la UI
- `subscription` no debe usarse para decidir navegacion general
- `ownedOrganizationId` sirve para distinguir ownership real de contexto activo

## Caso recomendado para analytics

Orden recomendado:

1. Si `accountType == PENDING_INVITATION`, no entra.
2. Si `accessPolicy.canOpenAnalytics == true`, mostrar la ruta.
3. Si la pantalla necesita detalle fino, usar `GET /api/workforce/access`.
4. Si no viene ninguna senal valida, denegar.

## Integracion recomendada

El frontend deberia:

- leer `GET /api/business/workspace` una sola vez al arrancar el shell
- guardar la policy resuelta en una capa comun
- reutilizar esa misma policy en sidebar, paginas y acciones
- usar `GET /api/workforce/access` solo cuando necesite detalle fino de membresia
- no inventar permisos si falta un campo

## En una frase

El frontend debe tratar `GET /api/business/workspace` como la fuente unica de verdad para shell y navegacion, usar `authorization` para entender el rol humano del usuario, y usar `accessPolicy` para la entrada real a modulos.
