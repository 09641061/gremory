# Plan transversal Shared/App

`contexts/shared` no es un bounded context de negocio. Es infraestructura/interfaces compartida y debe evitar convertirse en un service locator entre BCs.

## Hallazgos

- `request-context.ts` permite que headers caller-supplied reemplacen Authorization, tenant y correlation: regresión P0/P1.
- `api-client.ts` hace casts `responseBody as T`; la validación debe ocurrir en adapters por endpoint. Además genera correlation por llamada, no necesariamente por operación request-scoped.
- Shared Application importa cookies/Next, gateways de Business/Billing/IAM y servicios concretos; viola la frontera Application.
- `app/` y shared UI importan Application internals e Infrastructure (por ejemplo app shell/sidebar, páginas de analytics y muchos Route Handlers).
- `safePublicError` es útil como mapper de borde, pero faltan diagnóstico protegido y sanitizer de stacks/causes.
- Proxy debe mantenerse fino; layout/proxy no sustituyen autorización de operación.

## Plan

1. Restaurar precedencia autoritativa case-insensitive de `Authorization`, `X-Organization-Id` y `X-Correlation-Id`; rechazar/ignorar overrides no confiables. Actualizar el test que hoy codifica el comportamiento inseguro.
2. Definir `RequestContext` server-only en el borde: requestId generado/validado, actor/tenant explícitos, no idempotency/auth. Pasarlo a todos adapters.
3. Mantener ApiClient como transporte sin afirmar tipos runtime; obligar a cada gateway a parsear su contrato. Conservar `no-store`, timeout, SSRF path guard y Problem Details.
4. Mover la composición cross-context de `contexts/shared/application` a `interfaces/server`/orchestrator server-only. Application solo recibe ports `WorkspaceReader`, `SubscriptionReader`, etc.; no cookies, `ApiError` de Infrastructure ni gateways.
5. Encapsular `sanitizeError`/diagnostic policy y hacer `recordSafely` no-throw, bounded, con causes sanitizadas y sin raw body/header/message/token.
6. Hacer páginas/layouts/Route Handlers delegar a reads/actions de `interfaces`, sin imports directos a Domain/Application internals/Infrastructure. Mantener `await params/searchParams` y Suspense donde haya APIs dinámicas.
7. Evitar duplicaciones de shell/profile/assistant reads y no usar cache compartido para sesión. Tags solo con política explícita.
8. Añadir regla/test de arquitectura para dependencias y comprobar imports transitivos de Client Components.

## Tests/gates

Header spoofing (casing); correlation estable por operación; sanitizer con cycles/getters/stacks maliciosos/PII; no raw logs; error mappings; app pages thin; no Application→Infrastructure/Next/React/Zod; no Domain platform types.
