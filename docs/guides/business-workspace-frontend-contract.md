# Business Workspace Frontend Contract

Este documento define el contrato que el frontend debe consumir para resolver acceso, navegacion y contexto del workspace.

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

La unica capa canonica de acceso para navegacion es `accessPolicy`.

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

## Significado de los campos

- `accountType`
  - contexto activo del workspace
  - valores posibles: `OWNER`, `MEMBER`, `PENDING_INVITATION`
- `onboardingStatus`
  - estado de onboarding del workspace
- `onboardingCompleted`
  - indica si el onboarding minimo ya termino
- `organization`
  - organizacion activa del workspace
- `establishments`
  - locales accesibles dentro de ese workspace
- `activeEstablishmentId`
  - local que el backend resolvio como contexto activo
- `subscription`
  - estado de la suscripcion del owner
- `pendingInvitation`
  - informacion visible solo para invitaciones pendientes
- `accessPolicy`
  - resolucion final de acceso para shell y navegacion
- `ownedOrganizationId`
  - organizacion que realmente pertenece a la cuenta, aunque este navegando como member en otro workspace

## `accessPolicy`

`accessPolicy` es el unico bloque que el frontend debe usar para decidir:

- sidebar
- tabs
- rutas protegidas
- empty states de navegacion
- botones de primer nivel

Campos:

- `canOpenAnalytics`
- `canOpenScheduling`
- `canOpenCrm`
- `canOpenCatalog`
- `canOpenTeam`
- `canUseAssistant`
- `canCreateEstablishment`
- `canManageBilling`

## Reglas duras

- `PENDING_INVITATION` debe resolver todo en `false`
- si un flag no viene, el frontend debe denegar por defecto
- `OWNER` no significa acceso total automatico
- `subscription` no debe usarse para decidir navegacion general
- `accountType` sirve para UX, no para autorizacion
- `ownedOrganizationId` sirve para distinguir ownership real de contexto activo

## Fallback temporal

Solo por compatibilidad temporal:

- el frontend puede usar un fallback acotado mientras el backend termina de emitir un flag correcto
- ese fallback no debe convertirse en regla permanente
- si `accessPolicy` ya existe, tiene prioridad sobre cualquier inferencia local

## Uso por dominio

- `accessPolicy`
  - decide acceso global
- `effectivePermissions`
  - puede servir para detalle fino de una pantalla especifica
- `subscription`
  - sirve para billing y limites
- `accountType`
  - sirve para UX y layout

## Caso recomendado para analytics

Orden recomendado:

1. Si `accountType == PENDING_INVITATION`, no entra.
2. Si `accessPolicy.canOpenAnalytics == true`, mostrar la ruta.
3. Si la pantalla necesita detalle fino, usar `GET /api/workforce/access`.
4. Si no viene ninguna senal valida, denegar.

Idea central:

- el owner no se infiere en la pagina
- el owner se resuelve en el shell o en `business/workspace`
- la pagina solo consume el permiso ya resuelto

## Integracion recomendada

El frontend deberia:

- leer `GET /api/business/workspace` una sola vez al arrancar el shell
- guardar la policy resuelta en una capa comun
- reutilizar esa misma policy en sidebar, paginas y acciones
- usar `GET /api/workforce/access` solo cuando necesite detalle fino de membresia
- no inventar permisos si falta un campo

## En una frase

El frontend debe tratar `GET /api/business/workspace` como la fuente unica de verdad para shell y navegacion, y `accessPolicy` como el contrato oficial de acceso.
