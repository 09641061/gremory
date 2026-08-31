# 03 — Workforce: `bunx tsc --noEmit` roto por nullability no propagada

## Contexto / problema

`bunx tsc --noEmit` **falla hoy en `develop`, sin cambios locales**, con 6
errores en 3 archivos:

```
contexts/workforce/application/internal/queryservices/team-query.service.ts(48,24): error TS18047: 'preview.establishmentId' is possibly 'null'.
contexts/workforce/application/internal/queryservices/team-query.service.ts(49,7): error TS2322: Type 'string | null' is not assignable to type 'string'.
contexts/workforce/infrastructure/gateways/team-api.gateway.ts(97,8): error TS2322: Type '... | null' is not assignable to type 'Readonly<{ value: string; }>'.
contexts/workforce/infrastructure/gateways/team-api.gateway.ts(100,7): error TS2322: Type 'string | null' is not assignable to type 'string'.
contexts/workforce/interfaces/components/team/member-row.tsx(124,52): error TS2769: No overload matches this call. (FormData.append, string | null)
contexts/workforce/interfaces/components/team/member-row.tsx(142,52): error TS2769: No overload matches this call. (FormData.append, string | null)
```

### Causa raíz

El commit `74efd69 "feat: workforce segun la guia"` adaptó los **schemas de
zod** al nuevo contrato del backend pero no propagó los tipos ni actualizó a
todos los consumidores aguas abajo:

1. `teamPageResourceSchema` (en
   `contexts/workforce/interfaces/rest/schemas/team.schemas.ts`) cambió de
   la forma `Page` de Spring (`number`, `first`, `last`, `numberOfElements`,
   `empty`) a la nueva `PageResponse<T>` del backend (`content`, `page`,
   `size`, `totalElements`, `totalPages`). El gateway (`team-api.gateway.ts`,
   método `list`, líneas ~97-100 aprox., justo antes/dentro del bloque que
   arma `TeamPageResult`) sigue reconstruyendo el shape viejo (`first`,
   `last`, `numberOfElements`, `empty`) a partir de los campos nuevos —
   esto **no** es la causa de los errores TS18047/TS2322 en ese archivo
   (esos son de `getMyMembership`, ver punto 2), pero conviene revisarlo
   igual como parte de este plan porque toca el mismo archivo y el mismo
   commit.

2. El mismo commit volvió `establishmentId`/`establishmentName` nullable en
   dos schemas distintos, por la misma razón de negocio: el backend ahora
   resuelve contexto de organización sin establecimiento en algunos casos
   (`GET /api/workforce/members/me` acepta un header `X-Organization-Id` y
   puede devolver una membresía sin establecimiento asociado):
   - `workforceCurrentMemberResourceSchema.establishmentId`: `uuidSchema.nullable()`
   - `invitationPreviewResourceSchema` sigue con `establishmentId: uuidSchema` (no nullable) en el schema, **pero** la interfaz de dominio `TeamInvitationPreview.establishmentId` sí se cambió a `TeamEstablishmentId | null` (`contexts/workforce/domain/services/team.repository.ts:38`), aunque el gateway (`previewInvitation`, líneas ~144-162) siempre construye un valor no-nulo con `createTeamEstablishmentId(resource.establishmentId)`. Esto crea un desajuste: el tipo de dominio permite `null` pero en la práctica (dado el schema actual) nunca lo es para este flujo — **decisión a tomar en el paso 1**.

3. Estos cambios de tipo nunca llegaron a:
   - `TeamMembershipContext` (usada por `getMyMembership`, en `team.repository.ts` — revisar si ya es `TeamEstablishmentId | null` o si falta actualizarla).
   - `TeamInvitationPreviewView` (`team.read-models.ts`), consumida por `team-query.service.ts:48-49`, que sigue declarando `establishmentId: string` (no nullable).
   - `member-row.tsx`, que ya recibe `member.establishmentId: string | null` en `TeamUserSummary` (ese campo ya era nullable antes de este commit, por invitaciones pendientes sin usuario asignado), pero el bug ahí es distinto: ver paso 3 abajo.

## Archivos a tocar

- `contexts/workforce/domain/services/team.repository.ts` (verificar consistencia de `TeamInvitationPreview` y `TeamMembershipContext`)
- `contexts/workforce/application/model/team.read-models.ts` (`TeamInvitationPreviewView`)
- `contexts/workforce/application/internal/queryservices/team-query.service.ts` (línea ~48-49, método `previewInvitation`)
- `contexts/workforce/infrastructure/gateways/team-api.gateway.ts` (líneas ~90-105, método `getMyMembership`)
- `contexts/workforce/interfaces/components/team/member-row.tsx` (líneas ~113-150 aprox., callbacks `onCheckedChange`)
- Componentes que consumen `TeamInvitationPreviewView.establishmentId`/`establishmentName` como no-nulos: `contexts/workforce/interfaces/components/invitations/pending-invitation-view.tsx:19,53` y `contexts/workforce/interfaces/components/invitations/invitation-acceptance-view.tsx:76` (a revisar si terminan afectados según la decisión del paso 1)
- Tests de gateway existentes: `contexts/workforce/infrastructure/team-api.gateway.test.ts` (extender casos)

## Pasos

### 1. Decidir y resolver la nullability de `establishmentId` en la preview de invitación

Este es el único punto donde hay ambigüedad real: el schema de red
(`invitationPreviewResourceSchema`) dice que `establishmentId` **siempre**
viene (no nullable), pero el tipo de dominio (`TeamInvitationPreview`) dice
que puede ser `null`. Antes de tocar código, confirmar contra el backend
(`haimiya`, controlador de invitaciones de workforce) si `GET
/api/workforce/invitations/preview` puede realmente devolver una invitación
sin establecimiento, o si el `null` en `TeamInvitationPreview` fue un
copy-paste del cambio hecho en `TeamMembershipContext`/`workforceCurrentMemberResourceSchema`
sin que aplique a este endpoint.

- **Si el backend confirma que preview nunca es sin establecimiento**:
  revertir `TeamInvitationPreview.establishmentId`/`establishmentName` a no
  nullable en `team.repository.ts` (dejar `invitationPreviewResourceSchema`
  como está, ya es correcto). Esto resuelve los errores de
  `team-query.service.ts:48-49` sin tocar `TeamInvitationPreviewView` ni los
  componentes de invitación, que ya asumen no-nulos.
- **Si el backend confirma que sí puede venir sin establecimiento**:
  actualizar `invitationPreviewResourceSchema.establishmentId`/`establishmentName`
  a `.nullable()`, propagar el `null` en `previewInvitation` del gateway
  (`team-api.gateway.ts:144-162`), en `TeamInvitationPreviewView`
  (`team.read-models.ts`) y en `team-query.service.ts:48-49` (usar
  `preview.establishmentId?.value ?? null`), y decidir explícitamente el
  comportamiento de UI en `pending-invitation-view.tsx` e
  `invitation-acceptance-view.tsx` para cuando no hay establecimiento (ver
  paso 4 — mismo criterio que para `getMyMembership`).

Documentar la decisión tomada como comentario breve en
`team.repository.ts` junto a la interfaz, para que no se repita esta
ambigüedad en el próximo cambio de contrato.

### 2. `getMyMembership` en el gateway — propagar el `null`, no forzar

En `contexts/workforce/infrastructure/gateways/team-api.gateway.ts`, el
bloque actual (aprox. líneas 90-105):

```ts
return {
  memberId: resource.memberId ? createMemberId(resource.memberId) : null,
  userId: resource.userId ? createTeamUserId(resource.userId) : null,
  organizationId: createTeamOrganizationId(resource.organizationId),
  organizationName: resource.organizationName,
   establishmentId: resource.establishmentId
     ? createTeamEstablishmentId(resource.establishmentId)
     : null,
  establishmentName: resource.establishmentName,
  ...
};
```

`resource.establishmentId ? createTeamEstablishmentId(...) : null` ya
maneja el `null` correctamente del lado del `resource` (zod). El error
TS2322 en la línea 97-100 indica que el **tipo de retorno** (`TeamMembershipContext`
en `team.repository.ts`) todavía no declara `establishmentId`/`establishmentName`
como nullable. Actualizar la interfaz `TeamMembershipContext` en
`team.repository.ts`:

```ts
establishmentId: TeamEstablishmentId | null;
establishmentName: string | null;
```

No cambiar el cuerpo del método — ya está bien, el error es puramente de
tipo declarado vs. tipo inferido.

### 3. `member-row.tsx` — capturar el valor narrowed antes del closure

Las líneas 124 y 142 fallan porque, aunque la condición externa
(`member.userId && member.establishmentId && member.status === "ACTIVE"`)
narrowea `member.establishmentId` a `string` para el bloque JSX, TypeScript
**no** conserva ese narrowing dentro del closure `onCheckedChange={(available) => { ... }}`,
porque entre la evaluación de la condición y la ejecución del callback
`member` podría (en teoría, para el compilador) haber cambiado. El fix no es
un `!` (non-null assertion) sino capturar el valor ya narrowed en una
variable local antes de renderizar el callback:

```tsx
{member.userId && member.establishmentId && member.status === "ACTIVE" ? (
  (() => {
    const userId = member.userId;
    const establishmentId = member.establishmentId;
    return (
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch
          checked={member.availableForScheduling}
          disabled={!canEditAvailability || availabilityPending}
          onCheckedChange={(available) => {
            if (available === member.availableForScheduling) return;
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("establishmentId", establishmentId);
            formData.append("available", String(available));
            startTransition(() => availabilityAction(formData));
          }}
          size="sm"
        />
        {member.availableForScheduling ? "Available for appointments" : "Unavailable for appointments"}
      </label>
    );
  })()
) : null}
```

Aplicar el mismo patrón al segundo bloque (línea ~142, el de
`visibilityAction`). Si el repo prefiere evitar el IIFE por legibilidad, la
alternativa aceptable es extraer un sub-componente
`MemberSchedulingControls` que reciba `userId: string` y
`establishmentId: string` ya no-nulos como props, renderizado
condicionalmente desde el padre — preferible si se repite este patrón en
más de 2 lugares del archivo. Elegir una sola de las dos formas y aplicarla
consistentemente a ambos bloques (no mezclar IIFE en uno y componente en el
otro).

No usar `member.userId!`/`member.establishmentId!`: esconde el problema real
(el compilador tiene razón en que, técnicamente, dentro de un closure que se
ejecuta de forma asíncrona más tarde, `member` podría no ser el mismo objeto
si el componente se re-renderiza con otro `member` antes del click — poco
probable en la práctica dado que cada fila tiene su propio `member`, pero la
captura explícita es la forma correcta de expresar la invariante y es lo que
pide el enunciado del fix, no forzar con `!`).

### 4. Decisión de UI explícita para "sin establecimiento" en `getMyMembership`

`getMyMembership` ahora puede devolver una membresía con
`establishmentId: null`/`establishmentName: null` cuando el usuario
autenticado tiene contexto de organización pero no de establecimiento
(vía header `X-Organization-Id` sin establecimiento). Revisar cada
consumidor de `TeamUserSummary`/`TeamMembershipContext` con `establishmentId`
nulo y decidir explícitamente qué mostrar (no dejarlo implícito):

- Buscar consumidores: `grep -rn "getMyMembership\|TeamMembershipContext" contexts/workforce -r`
- Para cada uno, decidir: ¿ocultar el control (como ya hace `member-row.tsx`
  con la condición `member.establishmentId &&`)? ¿Mostrar un estado
  "Sin establecimiento asignado"? Este plan no prescribe la respuesta de
  producto — es responsabilidad de quien implemente decidirla con el
  criterio ya usado en `member-row.tsx` (ocultar controles que dependen de
  `establishmentId` cuando es `null`) como precedente por defecto, salvo que
  haya una razón de UX para hacer algo distinto.

## Tests requeridos

1. **`team-api.gateway.test.ts`** — extender:
   - `getMyMembership` con `resource.establishmentId: null` en la respuesta
     mockeada → el `TeamMembershipContext` devuelto tiene
     `establishmentId: null` y `establishmentName: null` (no lanza, no
     castea a un objeto vacío).
   - `getMyMembership` con `resource.establishmentId` presente → sigue
     devolviendo `TeamEstablishmentId` construido correctamente (test de
     regresión).
   - `list` (si no está ya cubierto) — la respuesta con forma
     `{content, page, size, totalElements, totalPages}` se mapea
     correctamente a `TeamPageResult` incluyendo `first`/`last`/`numberOfElements`/`empty`
     derivados.
   - `previewInvitation` — según la decisión tomada en el paso 1: si quedó
     no-nullable, un test de regresión que confirme que sigue exigiendo
     `establishmentId` en el schema; si quedó nullable, un test con
     `resource.establishmentId: null`.
2. **`team-query.service` tests** (si existen, o nuevos) — `previewInvitation`
   propaga correctamente el resultado del repository sin perder el
   `establishmentId` (nulo o no, según la decisión).
3. **`member-row.tsx`** (si el repo testea componentes de esta carpeta —
   verificar con `find contexts/workforce/interfaces/components/team
   -iname "*.test.tsx"`): con `member.establishmentId: null`, los controles
   de disponibilidad/visibilidad no se renderizan (test de regresión del
   comportamiento ya existente, ahora protegido por tipos correctos en vez
   de por casualidad).

## Criterio de aceptación

- `bunx tsc --noEmit` sin errores (0 errores, no solo "sin nuevos errores" —
  el estado actual de `develop` ya está roto).
- `bun run test` en verde, incluyendo los tests nuevos/extendidos de arriba.
- Prueba manual: como admin de una organización sin establecimiento
  seleccionado (o con un usuario cuya membresía no tiene establecimiento),
  visitar la página de equipo y confirmar que no hay errores de runtime ni
  controles rotos (switches deshabilitados/ocultos correctamente en vez de
  crashear).

## Riesgos / qué no romper

- No usar `!` (non-null assertion) ni `as string` para silenciar los
  errores de tipo — el enunciado pide propagar la nullability real, no
  esconderla; hacerlo con cast reintroduce el mismo bug en runtime que
  `tsc` está detectando ahora en compile-time.
- El cambio en `teamPageResourceSchema` (forma `PageResponse<T>`) ya está
  reflejado en el gateway (`list`); no tocar esa reconstrucción salvo que
  al revisarla se detecte un bug adicional — no está entre los 6 errores
  reportados, así que no forma parte del alcance obligatorio de este plan,
  pero merece una revisión rápida por estar en el mismo commit y el mismo
  archivo.
- No cambiar el comportamiento de negocio de qué endpoint se llama ni qué
  header se manda (`X-Organization-Id` vs `establishmentId` query param) —
  esto es puramente sobre propagar tipos y decidir UI para el caso nulo, no
  sobre cambiar cómo se resuelve el contexto de organización.

## Tamaño estimado

**M** — 3 archivos con errores de compilación directos, más 2-4 archivos
adicionales de tipos/componentes de invitación dependiendo de la decisión
del paso 1, más tests.
