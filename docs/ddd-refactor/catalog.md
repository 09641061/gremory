# Plan BC Catalog

**Modelo:** REMOTE FEATURE. Backend posee servicios/categorías y sus invariantes. Entidades/value objects/domain services actuales son principalmente mapeo y duplicación.

## Hallazgos

- Command/query services de Application importan y construyen gateways.
- Route Handlers autorizan pero en varias mutaciones no pasan token/organizationId a la composición; se pierde el tenant.
- List/search no validan response pages runtime; solo detail/create/update parsean.
- Autorización de target escanea páginas sin límite para encontrar una categoría.
- `app/catalog/page.tsx` invoca handlers internos y algunos read models de capas equivocadas.
- Tags se invalidan aunque lecturas protegidas son `no-store`; no son una garantía de cache.

## Plan

1. Crear ports catalog service/category y commands/queries/read models en Application.
2. Inyectar ports y mover gateway construction a `interfaces/server/catalog-composition.ts`; aceptar auth/tenant/request context explícitos.
3. Mover response schemas/page envelopes a `infrastructure/contracts`; parsear cada list/detail/mutation.
4. Mantener schemas de input en Interfaces y hacer Route Handlers delgados: await params, validar, autorizar target, invocar composición, mapear error.
5. Reemplazar scan paginado de autorización por endpoint target-aware o gateway lookup acotado; no crear prechecks que prometan consistencia de write.
6. Eliminar Domain entities/value objects/domain services sin responsabilidad local demostrable.
7. Revisar `updateTag`: mantener solo con política de lectura/tag explícita; de lo contrario documentar `no-store`.

## Tests/gates

Fakes de ports; propagation token/organization/correlation; schemas malformed de páginas; target mismatch/denial sin scans ilimitados; invalidación y errores estables.
