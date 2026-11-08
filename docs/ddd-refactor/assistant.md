# Plan BC Assistant

**Modelo:** REMOTE FEATURE. Backend posee conversaciones, mensajes, IDs, reglas de título/contenido y autorización. Las entidades/value objects/repositorio de `domain/model` son una copia de un agregado remoto.

## Hallazgos

- Todos los command/query services de Application importan adaptadores/repositorio concretos y `server-only`.
- Páginas, acciones y Route Handlers instancian servicios/gateways distintos; el tenant de organización no es consistente.
- Mutaciones/lecturas suelen comprobar solo presencia del access token, no permiso Assistant ni target workspace.
- SSE se reenvía como bytes sin contrato de eventos, límites ni validación de payload.
- Infrastructure importa schemas de `interfaces/rest`.
- Read models se consumen desde rutas/clientes a través de `application/internal/transforms`, con duplicación por la entidad Domain.

## Plan

1. Mover commands/queries/read models a `application/commands`, `application/queries`, `application/models`; crear ports para reader, writer y streaming writer.
2. Convertir handlers a funciones/clases puras por inyección; eliminar `server-only` e imports outward de Application.
3. Crear `interfaces/server/composition.ts` que construya adapters con actor, organización, establecimiento y request ID. Todas las acciones, página y `app/api/assistant/**` lo usan.
4. Reducir/eliminar `domain/model` de Assistant y el repositorio duplicado; conservar únicamente normalización semántica que tenga uso real.
5. Separar schemas de input de los contratos de respuesta. Crear `infrastructure/contracts` y parsear cada respuesta.
6. Definir el contrato SSE (event names, payloads, límite, terminal/error/cancelación); validar en BFF antes de entregar al cliente y mapear fallos a mensajes estables.
7. Centralizar `requireActor`/`authorizeAssistantAccess` y verificar IDs de workspace server-side. Nunca confiar en `establishmentId` de cliente sin comprobación.

## Tests/gates

- Fakes para cada port; ninguna importación de Infrastructure en Application.
- Acceso denegado cross-tenant en action/route/page.
- Malformed response, status/error mapping, correlación/tenant/no-store.
- SSE malformed/oversized/error/cancelación.
- Write confirmado con invalidación fallida y errores sin raw message.

**Riesgo/unknown:** confirmar operación atómica de mensajes y contrato SSE/autorización del backend antes de borrar definitivamente el agregado.
