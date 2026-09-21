# Plan BC Analytics

**Modelo:** REMOTE FEATURE. El backend posee dashboards, autorización, agregación y persistencia. `AnalyticsDateRange` puede quedarse solo como helper puro de construcción de query; `AnalyticsExportService` debe salir de Domain porque usa `document`, `Blob` y `URL`.

## Hallazgos

- `application/internal/queryservices/get-*-analytics-query.service.ts` importa `AnalyticsApiGateway`, `server-only` y schemas de Infrastructure; rompe DIP y filtra contratos del proveedor.
- `app/(protected)/(app)/analytics/page.tsx` construye `BusinessWorkspaceApiGateway`, lee contratos Zod de Infrastructure y decide el plan Max por texto (`includes("max")`). No pasa por autorización Analytics en la lectura inicial.
- `fetchMaxAnalyticsAction` solo valida `analytics:read`; una llamada directa puede intentar Max sin capability explícita.
- Gateway estático duplica construcción de query/headers y usa token opcional.

## Plan

1. Crear `application/ports/analytics-reader.ts`, commands/queries y read models serializables para Standard/Max.
2. Convertir los query handlers en clases puras que reciben el port; quitar `server-only` y imports de Infrastructure.
3. Crear `interfaces/server/analytics-composition.ts` server-only. Debe recibir actor/workspace autorizado, tenant y request context; construir el gateway instance y propagar correlación.
4. Mover schemas de respuesta a `infrastructure/contracts` (ya están allí, pero la UI/Application no los debe importar) y mapearlos a read models de Application.
5. Centralizar `requireAnalyticsContext` y una autorización explícita para Max basada en capability/backend, no en `planName` visible.
6. Reducir la página a resolución de params, autorización, composición y render de view models. Mantener Suspense.
7. Mover exportación a `interfaces/client` y eliminar el Domain service de navegador.

## Tests/gates

- Port con fake reader; una llamada con query completo.
- Standard/Max denial, tenant/establishment inválido y Max sin capability.
- Schemas runtime para payloads malformed, headers de organización/correlación y `no-store`.
- Action con preset/ID inválido y error estable; no logs crudos.
- UI importa solo application read models.

**Riesgo/unknown:** confirmar nombre de capability Max y semántica autorizada de `organizationId`/`establishmentId` con backend.
