# Plan maestro: limpieza DDD de Next.js

## Alcance y evidencia

Este plan se deriva de una revisión independiente por bounded context: diez agentes para `analytics`, `assistant`, `billing`, `business`, `catalog`, `crm`, `iam`, `notifications`, `profiles`, `scheduling` y un agente adicional para `shared`. La evidencia de la revisión está en el workflow `ec4e6bd1-da03-4f01-b3f0-95cfc5d3055a`.

Estado inicial verificado:

- Next.js `16.3.4`, React/React DOM `19.2.8`, TypeScript `~6.0.3`.
- `cacheComponents: true` ya está habilitado; no se adoptarán APIs de caché sin política de identidad/autorización.
- `bun run lint`, `bun run test` (126 archivos, 848 tests) y `bunx tsc --noEmit` pasan en el estado inicial.
- Hay cambios sin commit del usuario en `profiles/*` y `shared/infrastructure/http/request-context.ts`; no se descartan. Se corrige su impacto arquitectónico y de seguridad.

## Decisiones de arquitectura

1. Los diez BC funcionales se tratan como **REMOTE FEATURE**: Spring/API posee persistencia, IDs, autorización de negocio y reglas autoritativas.
2. No se mantendrán agregados TypeScript que solo reconstruyen respuestas HTTP. Se conservan únicamente políticas puras con responsabilidad local real, por ejemplo normalización de return paths de IAM y políticas de navegación.
3. `app/` queda como shell de routing. La composición server-only y la orquestación de cada BC viven en `interfaces/server/`.
4. `application/` contiene commands, queries, read models y ports propiedad del consumidor. No importa `Infrastructure`, `Interfaces`, React, Next.js, Zod, cookies ni `server-only`.
5. `infrastructure/` contiene `fetch`, credenciales, timeouts, correlación, contratos de proveedor y validación runtime. No importa schemas de `interfaces`.
6. `interfaces/` contiene schemas de entrada, Server Actions, Route Handlers, autorización, composición y UI. La UI recibe datos serializables.
7. Los tokens, tenant IDs y request IDs se generan/verifican en el borde server; nunca se confía en headers/form data del navegador.
8. Las lecturas protegidas permanecen `no-store` por defecto. `updateTag`/`revalidatePath` solo se usan con rutas/tags reales y fallos de invalidación no convierten un write confirmado en error.

## Orden de implementación

### Fase 1 — Seguridad y contratos compartidos (P0)

- Restaurar precedencia de `Authorization`, tenant y correlación en `request-context.ts`.
- Hacer la comparación de headers case-insensitive y agregar regresiones contra spoofing.
- Añadir request context server-scoped y diagnóstico sanitizado; eliminar logs de errores/body/token crudos.
- Centralizar tipos de `PageResponse`, `ApiError`, errores técnicos y serialización segura.

### Fase 2 — Puertos y composición

- Crear ports bajo `application/ports/` y commands/queries bajo `application/commands/` y `application/queries/`.
- Convertir servicios de aplicación en handlers puros por inyección; eliminar instanciación de gateways y `server-only` de Application.
- Crear `interfaces/server/*-composition.ts` por BC; allí se construyen adaptadores request-scoped con actor/tenant/request ID.
- Actualizar acciones, páginas y Route Handlers para invocar composición, nunca clases concretas de Infrastructure.

### Fase 3 — Contratos de proveedor y traducción

- Separar schemas de entrada (`interfaces`) de schemas de respuesta (`infrastructure/contracts`).
- Validar cada respuesta exitosa no vacía en Infrastructure, incluyendo páginas, invoices, roster, CRM, notificaciones y streams SSE.
- Traducir fallos de protocolo, timeout y respuesta inválida a errores técnicos internos; no pasar `error.message` al cliente.

### Fase 4 — Borde de UI/routing

- Hacer páginas/layouts finos y `await` de `params`/`searchParams` en Next 16.
- Mover fetches browser-only a un adapter/Route Handler validado; la presentación no instancia servicios ni gateways.
- Corregir autorización por operación/tenant/target y rutas de invalidación reales.
- Mantener Client Components solo para interacción, estado y APIs de navegador.

### Fase 5 — Simplificación

- Eliminar agregados, repositorios, DTOs y value objects duplicados de los BC remotos cuando no haya invariant local demostrable.
- Conservar políticas puras justificadas y documentar cualquier excepción rich-domain.
- Eliminar factories singleton que puedan capturar contexto request-scoped y quitar duplicación de lecturas.

### Fase 6 — Verificación

- Añadir una prueba de arquitectura que prohíba imports outward desde Domain/Application y platform types en Domain.
- Añadir tests de ports con fakes, autorización cross-tenant, schemas runtime, correlación, redacción y éxito de write aunque falle invalidación/telemetría.
- Ejecutar después de cada fase: `bun run lint`, `bun run test`, `bunx tsc --noEmit`; al final `bun run build` si el entorno tiene las variables backend requeridas.

## Gates de aceptación

- `rg` no encuentra `Infrastructure`/`Interfaces` imports en Application ni `next/*`, React, Zod, IO, `File`, `Blob`, `FormData` en Domain.
- Ningún adapter protegido se importa transitivamente en Client Components.
- Cada operación protegida autentica, autoriza, valida entrada, compone con actor/tenant/request ID y mapea errores estables.
- Cada adapter valida respuestas runtime y usa `cache: "no-store"` para datos protegidos.
- No hay endpoint de loopback innecesario ni cache compartido de datos de sesión.
- Los tests existentes siguen pasando y cada nuevo riesgo P0/P1 tiene prueba.

## Contratos que no deben inventarse

El repositorio no contiene el contrato Spring completo. Nombres de capacidades Max, autorización de organizaciones extranjeras, atomicidad de invitaciones, SSE, payloads de invoices/CRM y límites de uploads deben confirmarse contra OpenAPI/backend. Mientras no exista evidencia, se implementan validaciones seguras y se marca el comportamiento como unknown; no se fabrica una regla de negocio local.
