# Plan BC Notifications

**Modelo:** REMOTE FEATURE. Backend posee notification state e invitation workflow. No hay invariant local que justifique Domain.

## Hallazgos

- Hay dos modelos Notification duplicados en Domain; Application depende de gateway y factory compone Infrastructure.
- `registerDeviceToken` bypassa Application con import dinámico del gateway.
- Solo paginated notifications tiene schema runtime; unread/mark/accept/device usan casts.
- Aceptación hace dos operaciones no atómicas (mark accepted + accept invitation).
- `targetToken` llega al browser; confirmar si backend puede aceptar por notification ID.
- Push handler loguea payload Firebase completo; UI deriva acción por texto localizado `title.includes("accepted")`.

## Plan

1. Mover contracts/commands/results a Application y crear ports para reads/writes/device token; composición server-only en `interfaces/server/notification-composition.ts`.
2. Eliminar modelos/domain services duplicados una vez migradas UI y tests.
3. Mover/crear schemas de proveedor en Infrastructure y validar cada respuesta.
4. Encaminar device registration por Application; eliminar import dinámico de gateway.
5. Acordar operación atómica de invitación. Si backend no puede cambiar, documentar reconciliación/idempotencia y no prometer atomicidad local.
6. Evitar serializar target token si backend soporta ID-only; si es obligatorio, limitar/documentar y no loguear.
7. Remover log de payload y usar diagnóstico/redacted event; usar campo de estado/acción explícito, no título traducido.
8. Mantener composición request-safe, sin singleton que capture actor.

## Tests/gates

Ports/fakes; schemas de todas respuestas; partial failure invitation; token non-leakage; no raw push payload; action auth/validation/revalidation.

**Unknowns:** contrato de aceptación y necesidad real de `targetToken`.
