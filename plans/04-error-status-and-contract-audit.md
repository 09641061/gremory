# 04 — Auditoría de contratos: cambios de comportamiento sin ruptura de compilación

## Contexto / problema

El refactor de `haimiya` (`feature/add-reviwer-e2df`) cambió el shape y los
códigos de status de varias respuestas de error, y algunos payloads de
éxito. Ninguno de estos cambios rompe `bunx tsc --noEmit` (porque ningún
schema de zod en `gremory` usa `.strict()`, y porque los códigos de status
manejados con `error.status === N` siguen siendo válidos en la mayoría de
los casos), pero sí puede cambiar comportamiento observable en runtime. Este
plan es la auditoría de qué ya se verificó, qué falta, y cómo blindarlo con
tests de contrato para que el próximo cambio de backend no vuelva a pasar
desapercibido.

**Verificado hasta ahora:**

| BC | Cambio en backend | Archivo(s) frontend afectados | Estado |
|---|---|---|---|
| IAM | Varios 400 → 401 | `contexts/iam/infrastructure/gateways/iam-api.gateway.ts:81` (`verifyAccessToken`, ya chequea `status === 400 \|\| status === 401`); `contexts/iam/application/internal/queryservices/iam-session-query.service.ts:49` | OK, ya tolera ambos |
| CRM | Conserva 409/422 | `contexts/crm/.../register-customer.action.ts:45-47`, `.../update-customer.action.ts:41-43` | OK |
| CRM | Crear cliente ahora devuelve 201 con header `Location` | (no se lee `Location` en el frontend) | OK, compatible |
| Catalog | Excepciones tipadas: `CategoryNotFoundException`→404, `CategoryAlreadyExistsException`→409, `DuplicateCatalogServiceNameException`→409, `CatalogAccessDeniedException`→403 | pendiente de mapear archivo por archivo (ver paso 1) | A confirmar |
| Profiles | `ProfileController.getMyProfile` pasó de `notFound()` a lanzar `ProfileNotFoundException` — sigue siendo 404 | `contexts/profiles/infrastructure/repositories/http-profile.repository.ts:29`, `contexts/shared/application/internal/queryservices/entry-route-query.service.ts:124` | OK, ambos ya chequean `status === 404` |
| Profiles | `ProfileCommandServiceImpl.handle(UpdateProfileCommand/UpdateProfilePreferencesCommand)`: `IllegalArgumentException` (400) → `ProfileNotFoundException` (404), en `haimiya:src/main/java/com/takodu/profiles/application/internal/commandservices/ProfileCommandServiceImpl.java` | `contexts/profiles/interfaces/actions/update-profile.action.ts` — captura genéricamente `error instanceof Error ? error.message : "..."`, sin discriminar status | OK sin cambios necesarios, pero **frágil**: si en el futuro se quiere distinguir "perfil no encontrado" (caso borde, casi no debería ocurrir para un usuario autenticado) de un error de validación real, hoy no se puede porque no se lee `error.status` |
| Billing | `SubscriptionResponse` suma `pendingPlanId: Long\|null`, `pendingBillingCycle: String\|null` | Ningún schema zod usa `.strict()` → no rompe parseo | Compatible, pero **campos nuevos sin explotar** — ver paso 2 |

**Pendiente de verificar** (este plan lo cubre): Scheduling, Business,
Assistant/Chat, Analytics. El diff de backend (`git diff main..feature/add-reviwer-e2df --stat`
en `haimiya`) confirma que estos 4 BCs sí tuvieron cambios de código en la
rama, a diferencia de asumir que "no cambiaron":

```
.../queryservices/AnalyticsQueryServiceImpl.java
.../valueobjects/AnalyticsDecimalDailyPoint.java
.../AppointmentAnalyticsReadRepository.java
.../RevenueAnalyticsReadRepository.java
.../AnalyticsDecimalDailyPointResponse.java
.../commandservices/ChatCommandServiceImpl.java
.../chat/AssistantChatMessageFlow.java
.../acl/AssistantWorkforceAclService.java
.../internal/services/AssistantJobService.java
.../domain/model/entities/AssistantJob.java
.../infrastructure/ai/CustomerAssistantTools.java       (nuevo, +199)
.../ai/DeepSeekChatCompletionClient.java
.../ai/SchedulingAssistantTools.java                    (nuevo, +166)
.../ai/SpringAiDeepSeekAssistantAiService.java
.../jpa/repositories/AssistantJobRepository.java
.../rest/controllers/ChatController.java
.../EstablishmentCommandServiceImpl.java
.../ExternalWorkforceBusinessAccessService.java
.../BusinessWorkspaceQueryServiceImpl.java
.../domain/model/entities/Establishment.java
.../domain/model/entities/Organization.java
.../domain/model/entities/AppointmentHistory.java
.../jpa/repositories/AppointmentRepository.java          (-15, solo baja)
```

La mayoría son internos (tools de IA, servicios de análisis), pero al menos
`AnalyticsDecimalDailyPointResponse`, `ChatController`, `Establishment`,
`Organization` son candidatos directos a cambio de contrato REST y necesitan
revisión archivo por archivo contra sus equivalentes en `gremory`.

## Archivos a tocar

Este plan es de **auditoría + tests de contrato**, no de fix funcional
(salvo que la auditoría descubra una ruptura real, en cuyo caso tratarla
como un fix puntual y documentarlo). Los archivos candidatos a tocar son
tests nuevos, no producción:

- Nuevo: `contexts/catalog/infrastructure/gateways/*.gateway.test.ts` (o el equivalente existente) — casos de status 403/404/409
- Nuevo/extender: `contexts/scheduling/infrastructure/gateways/scheduling-api.gateway.test.ts`
- Nuevo/extender: `contexts/business/infrastructure/gateways/*.gateway.test.ts` (establishment, organization, workspace)
- Nuevo/extender: `contexts/assistant/infrastructure/gateways/assistant-api.gateway.test.ts`
- Nuevo/extender: `contexts/analytics/infrastructure/gateways/analytics-api.gateway.test.ts`
- Si la auditoría del billing (`pendingPlanId`/`pendingBillingCycle`) concluye que conviene exponerlos en la UI: `contexts/billing/...` (schema + view model + componente de upgrade/downgrade) — **solo si se decide explícitamente que es parte de este alcance**; por defecto, documentar como hallazgo y dejarlo para un plan/ticket aparte, ya que no está en la lista de requerimientos original.

## Pasos

### 1. Catalog — mapear excepciones tipadas a manejo del frontend

Para cada excepción nueva del backend, ubicar el/los gateway(s) de
`contexts/catalog` que llaman al endpoint correspondiente y confirmar que el
código ya interpreta el status correctamente (o que no necesita hacer nada
especial más allá de mostrar el mensaje de error, cubierto por el plan 01):

- `CategoryNotFoundException` → 404: revisar `GET/PUT/DELETE` de categoría — ¿el frontend distingue "no existe" de otros errores en algún flujo (p. ej. deep-link a una categoría borrada)?
- `CategoryAlreadyExistsException` → 409: revisar creación/rename de categoría — ¿hay manejo especial de 409 hoy (como en CRM, `register-customer.action.ts:45-47`) o se apoya en el mensaje genérico?
- `DuplicateCatalogServiceNameException` → 409: mismo análisis para servicios de catálogo.
- `CatalogAccessDeniedException` → 403: confirmar que ningún componente asuma 401 en vez de 403 para "sin permiso" dentro de catálogo (buscar `status === 401` en `contexts/catalog`).

Comando de partida:
```
grep -rn "status ===" contexts/catalog --include=*.ts
```
Si no hay ningún manejo especial de status en catálogo hoy (probable, dado
que Catalog es menos crítico que CRM/IAM), documentar que el comportamiento
por defecto (mostrar `error.message`, ya arreglado por el plan 01) es
suficiente y no requiere cambios — pero **dejarlo escrito explícitamente**,
no asumido.

### 2. Billing — decidir qué hacer con los campos nuevos

`SubscriptionResponse` ahora incluye `pendingPlanId`/`pendingBillingCycle`.
Ubicar el schema de zod de suscripción en `contexts/billing` y confirmar:

```
grep -rn "subscriptionResourceSchema\|SubscriptionResponse\|pendingPlanId" contexts/billing -r
```

- Si el schema es `z.object({...})` sin `.strict()` (esperado, según lo ya
  verificado), el parseo no falla — los campos nuevos simplemente se
  descartan al no estar declarados en el schema de zod (zod por defecto
  ignora claves no declaradas salvo `.strict()`).
- Decisión a documentar (no implementar en este plan salvo que se decida
  explícitamente ampliar el alcance): ¿la UI de upgrade/downgrade de plan
  necesita mostrar "tenés un cambio de plan pendiente para el próximo
  ciclo"? Si la respuesta de producto es sí, es un plan aparte (nueva
  funcionalidad, no un fix de compatibilidad) — no mezclarlo acá. Si la
  respuesta es "no por ahora", dejarlo anotado como deuda conocida.

### 3. Scheduling — verificar contrato de appointments

Backend tocó `AppointmentHistory` (entity) y `AppointmentRepository`
(-15 líneas, sin bajas de migración visibles desde el diff de código Java
solo — la baja de líneas puede ser refactor interno, no necesariamente
contrato). Revisar:

- `contexts/scheduling/infrastructure/gateways/scheduling-api.gateway.ts`: comparar el schema de respuesta de appointments contra `haimiya:src/main/java/com/takodu/scheduling/interfaces/rest/resources/*Response.java` (buscar `AppointmentResponse`, `AppointmentHistoryResponse` o similar) campo por campo.
- Confirmar códigos de error usados en creación/cancelación de turnos (conflictos de horario, etc.) siguen siendo los mismos status.

### 4. Business — verificar Establishment/Organization

`Establishment.java` y `Organization.java` sumaron 4 líneas cada uno (campos
nuevos, probablemente no rupturas sino adiciones). Revisar:

- `contexts/business/infrastructure/gateways/establishment-api.gateway.ts` y `organization-api.gateway.ts`: comparar campos contra los DTOs/Response de `haimiya:src/main/java/com/takodu/business/interfaces/rest/resources/`.
- `EstablishmentCommandServiceImpl.java` y `BusinessWorkspaceQueryServiceImpl.java` tuvieron cambios de lógica — confirmar que no cambiaron el shape de `WorkspaceResponse`/`EstablishmentResponse` de forma incompatible (campo renombrado, tipo cambiado, campo que pasó de opcional a requerido o viceversa).

### 5. Assistant/Chat — verificar `ChatController`

`ChatController.java` sumó 2 líneas — cambio pequeño pero en el controlador
REST, no en lógica interna de IA (los archivos `*Tools.java` y
`*AiService.java` son infraestructura de IA interna, no contrato REST, y
quedan fuera de alcance de esta auditoría salvo que expongan algo nuevo por
HTTP). Revisar:

- `contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts`: confirmar que el shape de request/response de chat sigue siendo compatible con lo que espera el schema de zod correspondiente.
- Si el streaming está activo (`apiConfig.assistant.useStreaming`), confirmar que el formato de los eventos de streaming no cambió.

### 6. Analytics — verificar shape de puntos diarios

`AnalyticsDecimalDailyPointResponse.java` cambió (2 líneas) y
`AnalyticsDecimalDailyPoint.java` (value object interno) también. Esto es
sospechoso de cambio de contrato directo (p. ej. tipo de `value` de
`BigDecimal` a `String` para evitar pérdida de precisión en JSON, patrón
común). Revisar:

- `contexts/analytics/infrastructure/gateways/analytics-api.gateway.ts` y su schema de zod: confirmar el tipo de los campos numéricos/decimales de la serie diaria (¿`z.number()` vs `z.string()`? un cambio de `BigDecimal` a `String` en el backend rompería un `z.number()` en el frontend sin que `tsc` lo detecte, porque JSON no distingue en compile-time).
- Prueba manual: cargar el dashboard de analytics gratuito
  (`apiConfig.routes.analytics.free`) y confirmar que los valores
  numéricos se renderizan correctamente (no `NaN`, no error de parseo de
  zod silencioso — revisar si el gateway hace `.parse()` o `.safeParse()`;
  si es `.parse()`, un tipo incompatible lanzaría una excepción visible, lo
  cual ya sería una señal clara).

### 7. Tests de contrato — blindaje a futuro

Para cada BC auditado en los pasos 1-6, agregar (o confirmar que ya existe)
al menos un test de gateway por endpoint que:

1. Mockee una respuesta de error con el shape RFC 7807 real que devuelve
   ese `@ExceptionHandler` específico del backend (no un mock genérico
   `{message: "error"}`), y confirme que el gateway lanza el error tipado
   correcto (`ApiError` o su subclase) con el `status` esperado.
2. Mockee una respuesta de éxito con el shape exacto documentado en el
   controller/response de `haimiya` (incluyendo campos nullable como
   `null` explícito, no solo el caso "feliz" con todos los campos
   presentes) y confirme que el `.parse()` de zod no lanza.

Estos tests son el mecanismo de blindaje: si el backend vuelve a cambiar un
shape sin coordinar, un test de contrato en CI debería fallar en vez de que
el bug llegue a producción silenciosamente (como pasó con `extractMessage`
en el plan 01).

## Criterio de aceptación

- Documento de hallazgos (puede ser un comentario/PR description, no hace
  falta un archivo nuevo si se resuelve como parte del PR) que confirme,
  para Scheduling, Business, Assistant/Chat y Analytics, uno de dos
  resultados por cada uno: "verificado compatible" (con qué se comparó) o
  "ruptura encontrada" (con el fix aplicado como parte de este plan, si es
  chico, o derivado a un plan/ticket aparte si es grande).
- `bun run test` en verde con los tests de contrato nuevos/extendidos de
  cada BC auditado.
- `bunx tsc --noEmit` sin errores (no debería verse afectado por este plan,
  ya que es principalmente auditoría + tests).
- Si se encuentra alguna ruptura real en Analytics (tipo `number` vs
  `string` en valores decimales) o en cualquier otro BC, agregar
  explícitamente el caso al criterio de aceptación de ese hallazgo puntual
  (comando de prueba manual + test de regresión).

## Riesgos / qué NO romper

- Este plan es de auditoría: **no cambiar comportamiento** salvo que se
  encuentre una ruptura real confirmada contra el código del backend (no
  contra suposiciones). Si hay duda sobre si algo rompió o no, marcarlo
  como "a confirmar con el equipo de backend" en vez de adivinar.
- No ampliar el alcance de Billing a implementar la UI de "cambio de plan
  pendiente" sin que se pida explícitamente — es una feature nueva, no un
  fix de compatibilidad, y se sale del contrato de "sin scope no pedido"
  que gobierna estos planes.
- No tocar `contexts/shared/infrastructure/http/api-client.ts` en este plan
  — ya está cubierto por el plan 01; si este plan se ejecuta después de 01,
  los tests de contrato deben asumir que `extractMessage` ya lee
  `message → detail → title`.
- No romper el flujo de sesión del `proxy.ts` ni el manejo de tokens: esta
  auditoría es sobre payloads de dominio, no sobre autenticación (eso ya lo
  cubre el plan 02, y la tolerancia a 400/401 en IAM ya está verificada OK
  arriba).

## Tamaño estimado

**L** — cubre 4 bounded contexts no verificados (Scheduling, Business,
Assistant, Analytics) más el cierre de las verificaciones puntuales de
Catalog y Billing, con lectura cruzada de código Java y TypeScript BC por
BC. El trabajo de "fix" en sí, si no aparecen rupturas reales, es chico
(solo tests); pero la auditoría manual es extensa por la cantidad de
archivos a comparar.
