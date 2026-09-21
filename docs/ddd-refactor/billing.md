# Plan BC Billing

**Modelo:** REMOTE FEATURE. Backend posee planes, precios, suscripciones, invoices, estado del proveedor de pagos, IDs y autorización. Elimina Plan/Subscription/pricing matrix/value objects si no protegen una regla local real; conservar como máximo una política pura de acceso para navegación.

## Hallazgos

- Query services importan/instancian gateways/adapters y actions/páginas también acceden Infrastructure.
- Invoice responses usan casts TypeScript sin schema runtime; UI importa `InvoiceResponse/PageResponse` de Infrastructure y hace fetch directo a `/api`.
- POST/PUT/DELETE de subscription solo verifican cookie token; falta autorización de billing/owner/tenant en cada operación.
- `create-subscription.action.ts` invalida `/invoices`, pero la ruta real es `/invoice`.
- Application command y UI usan tipos de Domain como contrato remoto.

## Plan

1. Crear ports `PlanReader`, `SubscriptionReader`, `SubscriptionWriter`, `InvoiceReader`, commands/queries y view models en Application.
2. Mover composición de gateways a `interfaces/server/billing-composition.ts`, request-scoped y con actor/correlation.
3. Mantener schemas de entrada en Interfaces; mover schemas de plan/subscription/invoice/page a `infrastructure/contracts` y parsear todos los endpoints.
4. Implementar autorización explícita `canManageBilling`/target tenant en actions y Route Handlers; no depender de upgrade-page gating.
5. Actualizar page/actions/routes para usar Application y view models; quitar fetch directo de componentes o encapsularlo en boundary validada.
6. Cambiar invalidación a `/invoice` y aislarla de write confirmado.
7. Eliminar entidades/pricing y commands de Domain no justificados.

## Tests/gates

Ports con fakes; malformed invoice/page; autorización directa; headers tenant/correlation; invalidación `/invoice`; no exposición accidental de `clientSecret`/keys; errores estables y no retry automático de outcome incierto.

**Unknowns:** autorización backend de billing, scoping de invoices y campos Stripe expuestos al browser.
