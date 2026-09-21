# Plan BC CRM

**Modelo:** REMOTE FEATURE. Customer e identity resolution son contratos/proyecciones del backend, no entidades locales.

## Hallazgos

- Gateway devuelve casts genéricos sin validar customer, resolved identity ni páginas.
- Delete y resolve-document actions aceptan strings/documentos sin schema de entrada.
- `resolve-document.action.ts` loguea error crudo y potencialmente PII.
- Ports están en Domain y los wrappers de Application son pass-through; UI importa `CustomerResponse` del Domain.
- Composición ya existe, pero debe ser la única construcción server-only.

## Plan

1. Crear `application/ports` y `application/models` para CRM; mover commands/queries fuera de Domain y quitar wrappers ceremoniales sin responsabilidad.
2. Crear `infrastructure/contracts/crm.schemas.ts` con customer, resolved identity y page; parsear toda respuesta exitosa.
3. Mantener schemas de input en Interfaces y validar delete/document resolution antes de workspace/auth/backend.
4. Usar composición server-only con actor/organization/establishment/request context; mantener `app`/actions delgados.
5. Sustituir logs crudos por diagnóstico sanitizado y correlacionado; devolver solo action states estables.
6. Actualizar Client Components a application view models y eliminar entity DTO de Domain.

## Tests/gates

Gateway malformed responses; authorization/validation de cada action y cross-establishment; safe diagnostics; write + revalidation; no-store y correlación.

**Unknowns:** envelope exacto backend y capacidades autorizadas (`crm:read`/`crm:manage`); no inventar retries/idempotencia.
