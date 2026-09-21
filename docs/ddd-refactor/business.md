# Plan BC Business

**Modelo:** REMOTE FEATURE. Backend posee organizaciones, establecimientos, IDs, permisos y persistencia. Las entidades/repositories TypeScript no deben reconstruir agregados remotos.

## Hallazgos

- Application instancia gateways/adapters e importa resources/schemas de Interfaces/Infrastructure.
- `business.repositories.ts` contiene `File` en el port de Domain; commands de upload se castean a `File` dentro de Application.
- Gateway de organización usa raw `fetch` para uploads, no la política común de timeout/correlación/error.
- Route Handlers/actions permiten operaciones sin autorización target consistente; organización extranjera puede mostrarse editable y luego rechazarse.
- Invalida rutas antiguas (`/organizations`, `/establishments`, `/organization`) en lugar de `/configuration/...`.
- Componentes escriben cookies literales desde browser.

## Plan

1. Crear ports Application para workspace reader, organization/establishment readers-writers y uploads; mover `BusinessWorkspaceSelection`/read models fuera de Infrastructure.
2. Convertir services de Application en handlers puros e inyectados; composición server-only en `interfaces/server/business-composition.ts`.
3. Separar response contracts/resources a `infrastructure/contracts`; dejar `interfaces/rest/schemas` solo para input.
4. Quitar entidades/repositorios/VO de agregados remotos tras migrar proyecciones; conservar únicamente políticas puras de navegación.
5. Unificar autorización target-aware para organización/establecimiento, creación y listados; no inferir permisos de UI.
6. Cambiar uploads a `apiClient.requestMultipart`, validar respuesta real y propagar actor/tenant/correlation.
7. Mover persistencia de selección de workspace a action/route server; eliminar `document.cookie` literal.
8. Centralizar constantes de revalidación y usar rutas reales.

## Tests/gates

Header spoofing con todas las mayúsculas; foreign org/establishment denial; route UUID/pagination; schemas malformed; upload timeout/correlation; cookies solo server; invalidación real.

**Unknowns:** soporte de edición de organizaciones extranjeras, payload multipart y si todos los Route Handlers `/api/business` son necesarios.
