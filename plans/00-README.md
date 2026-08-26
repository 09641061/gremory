# Índice de planes: frontend roto por cambio de contratos REST en el backend

## Contexto

La rama `feature/add-reviwer-e2df` de `haimiya` (backend, Spring Boot) ejecutó un
refactor de conformidad arquitectónica, guiado por los SDDs en
`plans/agy/` y `plans/codex/` de ese repo. El refactor tocó los contratos REST
de varios bounded contexts (IAM, CRM, Catalog, Billing, Profiles, Workforce)
sin tratarlos como un cambio de API pública ni coordinar con el frontend
(`gremory`). Resultado: el frontend, en `develop`, quedó con errores de
compilación, un flujo de login roto, y mensajes de error vacíos en toda la
aplicación.

Este directorio contiene el diagnóstico ya cerrado, convertido en planes de
ejecución independientes. **No re-derives el diagnóstico**: la evidencia
(archivo:línea) ya está en cada plan. Cada plan es autocontenido y puede
ejecutarse por separado, pero el orden recomendado minimiza tiempo con la app
rota:

## Orden de ejecución recomendado

1. **`01-api-client-problem-details.md`** — un solo archivo
   (`contexts/shared/infrastructure/http/api-client.ts`), arregla los mensajes
   de error en los 6 bounded contexts a la vez. Es el fix de mayor relación
   impacto/esfuerzo: hacelo primero para que el resto de las pruebas manuales
   (incluido el plan 02) muestren mensajes de error útiles en vez de genéricos.
2. **`02-iam-google-oauth-exchange.md`** — desbloquea el login con Google, que
   hoy está completamente roto. Es el de mayor severidad funcional.
3. **`03-workforce-page-response-types.md`** — devuelve la compilación a
   verde (`bunx tsc --noEmit` falla hoy en `develop` sin cambios locales).
   Bloquea CI y cualquier deploy, aunque no se note en dev en caliente.
4. **`04-error-status-and-contract-audit.md`** — la red de seguridad: audita
   todo lo que cambió de forma silenciosa (no rompe compilación, pero cambia
   comportamiento) y propone tests de contrato para que esto no vuelva a
   pasar sin darse cuenta.

## Tabla resumen de rupturas por bounded context

| Bounded context | Qué cambió en el backend | Efecto en el frontend | Plan |
|---|---|---|---|
| Shared / todos | `@RestControllerAdvice` migrado a RFC 7807 `ProblemDetail` (`type,title,status,detail,instance,timestamp`) en vez de `{timestamp,status,message}` | `extractMessage()` solo lee `.message` → todos los errores muestran el fallback genérico | 01 |
| IAM | Google OAuth callback ahora redirige con `#code=<exchangeCode>` (de un solo uso, vía Redis) en vez de `#access_token=&refresh_token=`; nuevo endpoint `GET /api/v1/auth/google/exchange?code=` | Login con Google roto: `auth-callback.tsx` no encuentra tokens en el hash y redirige a `/login` | 02 |
| IAM | Varios 400 → 401 | Sin impacto, ya tolerado en el gateway/query service | 04 (verificado OK) |
| Workforce | `teamPageResourceSchema`: forma `Page` de Spring → `PageResponse<T>` (`content,page,size,totalElements,totalPages`); `workforceCurrentMemberResourceSchema`: `establishmentId`/`establishmentName` ahora nullable | `bunx tsc --noEmit` falla en 3 archivos por `string \| null` no propagado | 03 |
| Catalog | Excepciones tipadas: `CategoryNotFoundException`→404, `CategoryAlreadyExistsException`→409, `DuplicateCatalogServiceNameException`→409, `CatalogAccessDeniedException`→403 | Sin impacto detectado, códigos ya esperados | 04 (a confirmar) |
| Profiles | `ProfileController` lanza `ProfileNotFoundException` (404) en vez de `ResponseEntity.notFound()`; en el `PUT` de perfil, un caso que antes era 400 (`IllegalArgumentException`) ahora es 404 | Sin impacto funcional: `updateProfileAction` captura el error genéricamente y muestra `error.message` sin discriminar status | 04 (verificado, con nota) |
| Billing | `SubscriptionResponse` suma `pendingPlanId`/`pendingBillingCycle` (nullable) | No rompe (ningún schema zod usa `.strict()`), pero la UI de upgrade/downgrade podría querer consumir estos campos nuevos | 04 |
| CRM | Crear cliente devuelve 201 con header `Location`; 409/422 se conservan | Sin impacto, el frontend no lee `Location` | 04 (verificado OK) |
| Scheduling, Business, Assistant/Chat, Analytics | No verificado todavía | — | 04 (pendiente, con plan de verificación) |

## Advertencia — bloqueante de deploy independiente del frontend

**El backend (`haimiya`, rama `feature/add-reviwer-e2df`) tiene un problema
que estos planes NO arreglan porque no es responsabilidad del frontend.** La
rama editó migraciones Flyway ya aplicadas y **borró 7 archivos de
migración** (`V13`, `V14`, `V15`, `V17`, `V18`, `V19`, `V20`), plegando su
contenido dentro de `V1`-`V9` y reescribiendo `V11`, sin agregar ni una sola
migración nueva.

Cualquier entorno con historial de Flyway ya aplicado (staging, producción,
cualquier base de datos que ya corrió las migraciones originales) va a fallar
por **checksum mismatch** al desplegar esa rama, y además nunca va a recibir
los cambios de esquema que se supone que trae. Esto se soluciona en
`haimiya`, no en `gremory`, pero quien ejecute los planes de este directorio
tiene que saber que el backend no está en condiciones de desplegarse tal
como está, más allá de que el frontend quede arreglado.
