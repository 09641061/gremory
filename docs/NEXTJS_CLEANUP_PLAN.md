# Plan de limpieza y refactorización de Next.js

**Alcance:** diagnóstico estático del proyecto completo y propuesta de implementación. Este documento no implementa los refactors ni cambia el comportamiento funcional.

## 1. Resumen ejecutivo

El proyecto tiene una base razonable de **Next.js App Router + DDD/hexagonal**, pero la arquitectura todavía no tiene fronteras consistentes. La complejidad principal no está en las páginas aisladas, sino en tres concentraciones:

1. `shared` actúa simultáneamente como design system, shell de aplicación, ACL de workspace, navegación, i18n y orquestador de varios contextos.
2. Los gateways y las Server Actions mezclan transporte HTTP, cookies, autorización, validación, mapeo y casos de uso.
3. Algunos contextos mantienen entidades y contratos de dominio; otros exponen directamente DTOs de transporte o capas passthrough.

El riesgo más importante es la **divergencia de autorización, sesión, caché e invalidación**. La prioridad debe ser estabilizar esos contratos antes de dividir componentes visuales grandes.

### Estado actual validado

- Next.js `16.3.1`, React `19.2.8`, TypeScript `~6.0.3`, Tailwind CSS v4 y shadcn/base-nova.
- App Router con route groups de protección, configuración y onboarding.
- `cacheComponents: true` en `next.config.ts`; las lecturas dinámicas están envueltas en varios `Suspense`, aunque la misma decisión se repite en proxy, layouts y páginas.
- 27 archivos de página y 21 route handlers bajo `app/api`.
- `bun run lint`: correcto.
- `bun run test`: **97 archivos, 456 tests correctos**.
- `bun run build`: correcto; Next compiló, verificó TypeScript y generó las rutas.
- La cobertura configurada en `vitest.config.ts` solo incluye `contexts/iam/**`; por tanto, el número de tests no representa cobertura homogénea de todos los bounded contexts.
- El workflow de CI ejecuta lint, cobertura y build, pero no ejecuta `bun run test:e2e`.

## 2. Mapa de bounded contexts

| Contexto | Responsabilidad | Estado observado | Dependencias/riesgo principal |
|---|---|---|---|
| **IAM** | Autenticación, sesión, refresh, cookies, OAuth, magic link | Es el contexto más coherente; `IamSessionQueryService` y el coordinador de refresh aportan comportamiento real | La lectura de cookies y la resolución de token se repiten fuera de IAM; `proxy.ts`, layouts y otros contextos acceden a infraestructura interna |
| **Business / Workspace** | Organización, establecimientos, imágenes, selección de workspace, onboarding y permisos derivados | Tiene entidades, value objects, comandos y servicios útiles | Es demasiado amplio y tiene el mayor fan-out; mezcla CRUD de negocio con read model de workspace y autorización |
| **Billing** | Planes, suscripciones, renovación, cancelación, facturas y Stripe | Tiene políticas de dominio útiles, especialmente acceso y pricing | Metadata de planes está hardcodeada en aplicación mientras también existe endpoint de planes; adapters y servicios duplican capas |
| **Catalog** | Categorías y servicios del catálogo | Tiene entidades, comandos, mappers y schemas | Contratos de aplicación se importan desde `domain`; DTOs también se redefinen en componentes; autorización y gateways son mixtos |
| **CRM** | Registro, edición, borrado y resolución de clientes/documentos | Funcional y cubierto parcialmente por acciones/componentes | `CustomerResponse` es un DTO de transporte dentro de `domain`; políticas CRUD parecen parcialmente stub (`canCreate/update/delete` quedan en `false`) |
| **Scheduling** | Citas, calendario, empleados, servicios y clientes disponibles | Tiene value object de estado, comandos y validación HTTP | Un gateway de 323 líneas concentra todos los endpoints; page data degrada errores a arrays vacíos; hay dos variantes del formulario de cita |
| **Assistant** | Conversaciones, mensajes, streaming SSE, títulos y sidebar | Buen modelo de conversación y transformaciones; tests de gateway/transform cubren contratos | `use-assistant-stream.ts` mezcla máquina de estados, SSE, fallback, router, draft y eventos de ventana |
| **Notifications** | Notificaciones, invitaciones, aceptación y borrado | Flujo funcional, pero con modelos duplicados | El dominio de invitaciones se mezcla con UI de notificaciones y actualización de cookies de workspace |
| **Profiles** | Perfil, preferencias de idioma/tema y avatar | La UI es relativamente contenida | La entidad de dominio no participa en el runtime; el repository de dominio devuelve `ProfileViewModel` de aplicación y la query cachea por token |
| **Shared / Platform** | HTTP client, i18n, primitives shadcn, shell, navegación, errores y ACL | Muy reutilizado | No es un bounded context neutral: importa Business, Billing, IAM, Assistant y Profiles; `AppSidebar` también importa varios contextos |
| **Workforce (implícito)** | Membresías, roles, permisos e invitaciones | No existe como contexto frontend autónomo; aparece en `apiConfig.routes.workforce`, workspace y notifications | Si crece, debe convertirse en contexto explícito o en un ACL bien definido; no seguir ampliando Notifications/Business |

### Grafo de dependencias relevante

```text
app / route handlers
        |
        v
platform (routing, session, workspace ACL, cache, errors)
        |
   +----+----------+---------+---------+---------+
   v               v         v         v         v
 Business       Billing    IAM      Profiles  Workforce/Notifications
   |
   +--> Catalog / CRM / Scheduling

Assistant usa IAM + workspace ACL, pero no debe depender del shell visual.
Shared UI/kernel debe quedar debajo de todos, sin importar dominios concretos.
```

La dirección deseada es: **routing → facade de contexto → application → domain ports → infrastructure**. Las dependencias entre contextos deben pasar por contratos ACL/outbound explícitos, no por imports profundos.

## 3. Diagnóstico transversal

### 3.1 Fronteras de capas inconsistentes

Casos concretos:

- `contexts/profiles/domain/repositories/profile.repository.ts` importa `ProfileViewModel` desde `application`.
- `contexts/catalog/domain/services/catalog-service.services.ts` y `service-category.services.ts` importan DTOs desde `application/model`.
- `contexts/business/application/internal/queryservices/organization-query.service.ts` importa schemas desde `interfaces/rest`.
- `contexts/profiles/infrastructure/repositories/http-profile.repository.ts` importa el mapper desde `interfaces/rest`.
- `contexts/business/domain/services/business.repositories.ts` expone `File`, un tipo DOM del navegador, desde un puerto de dominio.
- Varias acciones y gateways acceden directamente a cookies de IAM, `next/headers` o infraestructura de otro contexto.

**Regla propuesta:** el dominio no conoce Next, HTTP, cookies, `File`, React ni DTOs de UI; application no conoce componentes ni APIs de Next; infrastructure implementa puertos; interfaces adapta entrada/salida.

### 3.2 `shared` tiene responsabilidades de composición de aplicación

`contexts/shared/application/internal/queryservices/app-shell-query.service.ts`, `entry-route-query.service.ts`, `plan-home-route-query.service.ts` y `business-workspace.outbound.service.ts` coordinan Business, Billing e IAM. `ProtectedAppShell`, `AppSidebar` y `AppShellSidebarClient` agregan Assistant, Profiles, Notifications, Business y Billing.

Esto es válido como composición, pero no como `shared` neutral. Debe moverse a un módulo `platform`/`application-shell` o a la composición de `app`, dejando en `shared` únicamente kernel, HTTP, i18n y UI genérica.

### 3.3 Sesión, autorización y tenant se resuelven de varias maneras

Se observan simultáneamente:

- `requireIamAccessToken` para leer solo el access token.
- `getBusinessAccessToken`/`requireBusinessAccessToken` para refresh-aware resolution.
- resolvers locales en Assistant, Scheduling y Catalog.
- lecturas directas de `iamSessionCookies` en Billing, Profiles, Notifications y route handlers.
- `X-Organization-Id` añadido por gateways concretos.
- permisos recalculados o consultados en acciones mediante `BusinessWorkspaceQueryService`.

La diferencia entre token simple y token con refresh puede ser intencional, pero debe ser un contrato explícito. Actualmente una acción puede tener comportamiento distinto según el contexto que la invoque.

### 3.4 Entry routing duplicado

La misma decisión aparece en:

- `proxy.ts`.
- `app/(protected)/(app)/layout.tsx`.
- `app/(protected)/(configuration)/layout.tsx`.
- `app/(protected)/(onboarding)/layout.tsx`.
- `app/page.tsx` y `app/(protected)/(app)/welcome/page.tsx`.
- `AppShellQueryService` y `EntryRouteQueryService`.

`resolveEntryRoutePolicy` es un buen núcleo puro, pero sus inputs se obtienen y sus fallos se interpretan varias veces. El objetivo debe ser una resolución común con adaptadores específicos para Edge, Server Components y navegación cliente.

### 3.5 API route handlers repetitivos

Business, Catalog y Billing repiten `parseJsonBody`, validación del primer error, lectura de `status/details` y conversión a `{ message, details }`. Assistant usa otra variante de errores y parsea parámetros fuera del `try`.

Esto dificulta garantizar una respuesta uniforme tipo RFC 7807/9457 y hace que pequeños cambios de status o mensajes diverjan entre endpoints. Los handlers deben limitarse a parsear la request, invocar un handler de contexto y adaptar la respuesta.

### 3.6 Caché y revalidación

- `fetchMyProfileQuery` usa `use cache`, `cacheLife("hours")` y `cacheTag("profile")` recibiendo el access token como argumento. Debe revisarse si se desea cachear datos sensibles por usuario, el tamaño de la clave y la invalidación global del tag.
- `listPlansByCurrencyQueryService` usa `use cache`, `cacheLife("days")` y `cacheTag("billing-plans")`; es razonable para un catálogo fijo, pero la fuente hardcodeada debe aclararse frente a `BillingApiGateway.getPlans`.
- Billing, Catalog, Profiles y Business usan combinaciones distintas de `revalidatePath`/`updateTag`.
- Algunas mutaciones invalidan múltiples páginas (`/upgrade`, `/chat`, `/schedule`, `/invoices`), mientras otras solo invalidan un tag.

Debe existir una política de caché por tipo de dato: público/inmutable, por usuario, por tenant y estrictamente request-scoped.

### 3.7 Contratos de error y degradación

Scheduling convierte fallos de servicios/clientes/members en arrays vacíos; CRM devuelve una página vacía con `searchFailed`; Notifications silencia 401/403; otros contextos propagan `ApiError`. Estas son decisiones de UX diferentes, pero hoy no están modeladas en un contrato común de `success/degraded/failure`.

## 4. Diagnóstico por bounded context

### IAM

**Archivos clave:** `contexts/iam/infrastructure/gateways/iam-api.gateway.ts`, `contexts/iam/infrastructure/session/*`, `contexts/iam/application/internal/queryservices/iam-session-query.service.ts`, `proxy.ts`.

- `IamSessionQueryService` y `coordinateRefresh` son piezas valiosas y deben conservarse.
- `IamApiGateway` implementa a la vez comandos de autenticación y query de verificación; puede mantenerse como adapter HTTP, pero sus contratos deben salir de la infraestructura.
- `IamAuthenticationCommandServiceImpl` es casi passthrough.
- `create-session.action.ts`, `session.route.ts` y `sign-out.action.ts` duplican escritura/borrado de cookies. `create-session.action.ts` incluso borra `establishmentId` dos veces.
- Business implementa su propia resolución refresh-aware, mientras Catalog usa `requireIamAccessToken`.
- `verify-form.tsx` supera 200 líneas y el flujo auth está distribuido entre form, verify, callback y acciones.

**Plan:** hacer de IAM el único proveedor de un contrato de sesión server-side; dejar a otros contextos consumir un puerto `AuthenticatedRequestContext`, sin importar cookies internas.

### Business / Workspace

**Archivos clave:** `business-workspace-query.service.ts`, `workspace-navigation.policy.ts`, `business.services.ts`, gateways de organization/establishment/workspace y acciones.

- El dominio de Organization/Establishment sí contiene comportamiento e invariantes útiles.
- El contexto mezcla CRUD, imágenes, selección de tenant, onboarding, permisos, capacidades y navegación.
- `business-workspace-query.service.ts` concentra mapping, filtrado de establecimientos, fallbacks de permisos y read models.
- `workspace-navigation.policy.ts` contiene decisiones complejas y merece conservarse como policy pura, pero no debe convertirse en una segunda autorización del backend.
- Los formularios de organization y establishment siguen el mismo patrón de upload, validación, submit y feedback.
- Las actions duplican revalidación y autorización; CRM/Scheduling/Catalog consultan Business directamente para poder operar.

**Plan:** separar internamente `workspace/access` de `organization-establishment`, crear un ACL de workspace estable y hacer que los módulos reciban un `EstablishmentScope` ya resuelto.

### Billing

**Archivos clave:** `billing-api.gateway.ts`, `billing-subscription.adapter.ts`, `billing-invoices.adapter.ts`, `list-plans-query.service.ts`, `subscribe-view.tsx`, `invoice-view.tsx`.

- `BillingSubscriptionAdapter` y `BillingInvoicesAdapter` crean un gateway nuevo y solo delegan; revisar si aportan contrato o eliminarlos.
- `list-plans-query.service.ts` construye Standard/Premium y precios fijos, aunque el gateway también expone `getPlans`; decidir una sola fuente de verdad.
- `subscribe-view.tsx` mezcla selección, metadata, moneda/ciclo, checkout, errores y navegación.
- `invoice-view.tsx` mezcla fetch cliente, paginación, tabla, detalle y estados de error.
- Los route handlers de suscripciones repiten token, body parsing y respuestas de error para GET/POST/PUT/DELETE.
- `contexts/billing/interfaces/components/icons/standart.tsx` tiene un nombre inconsistente (`standart`).

**Plan:** estabilizar primero el contrato de suscripción/acceso; después separar catálogo de planes, checkout y facturas. Mantener la distinción entre consulta estricta para routing y consulta opcional para UI, pero nombrarla claramente.

### Catalog

**Archivos clave:** `category-sidebar.tsx`, `catalog-layout.tsx`, `edit-service-form.tsx`, gateways, acciones y `catalog-view.models.ts`.

- Hay entidades y mappers, pero los contratos de dominio importan `DetailedServiceDTO`/`CategoryDTO` desde application.
- `CategoryDTO`, `ServiceSummaryDTO` y `DetailedServiceDTO` también se declaran en componentes (`category-sidebar.tsx`, `service-detail-view.tsx`).
- Los command services son wrappers sin comportamiento; las query services resuelven cookies y construyen gateways desde application.
- `catalog-action-auth.ts` resuelve token y organization, pero las route handlers REST no tienen un patrón uniforme de autenticación explícita.
- `category-sidebar.tsx` concentra lista, drag/drop, sheet móvil, acciones y estados vacíos.
- Create/edit service comparten secciones pero no un contrato único de formulario.

**Plan:** mover DTOs de transporte al borde, definir read models canónicos en application, centralizar el scope de establecimiento y unificar el formulario de servicio sin mezclar permisos con presentación.

### CRM

**Archivos clave:** `customer.ts`, `crm-command.service.ts`, `crm-query.service.ts`, `crm-page-data.service.ts`, `crm-client-wrapper.tsx`, `customer-form.tsx`.

- `CustomerResponse` es una forma de respuesta del backend, no una entidad con invariantes; debe llamarse/moverse como read model o definirse una entidad real si se necesita comportamiento.
- `CrmCommandServiceImpl` y `CrmQueryServiceImpl` reciben un contrato de servicio y solo delegan al gateway.
- `PageResponse` está definido en `application/services/crm-query.service.ts` y se repite en otros contextos.
- `registerCustomerAction` consulta workspace dos veces: primero para autorización y después para obtener organization.
- `CrmAccessPolicyService` actualmente habilita lectura por existencia de establecimiento, pero deja las mutaciones en `false`; confirmar si es un stub o una regla real.
- El wrapper de cliente y el formulario concentran búsqueda, paginación, edición, borrado, permisos y feedback.

**Plan:** introducir un `CustomerReadModel`, un contrato de autorización de CRM basado en capacidades del workspace y un solo formulario reutilizable para alta/edición.

### Notifications / Workforce

**Archivos clave:** ambos `notification.ts`, `application/factory.ts`, `notification.actions.ts`, `notification-dropdown.tsx`.

- `domain/model/notification.ts` y `domain/model/entities/notification.ts` son duplicados idénticos.
- Las interfaces de application solo aliasan interfaces de domain.
- `notification-dropdown.tsx` combina polling cada 15 segundos, carga/paginación, renderizado, aceptación y borrado.
- La UI determina si una invitación está pendiente inspeccionando si el título contiene `accepted`; eso debe venir en un campo tipado, no en texto traducible.
- `acceptInvitation` marca la notificación y luego opera sobre Workforce; la persistencia de cookies de workspace está en la action de Notifications.

**Plan:** eliminar el duplicado, separar `NotificationList`/polling/controller, y decidir si invitaciones pertenecen a un contexto Workforce explícito o a un ACL de invitaciones. Notifications debe publicar el resultado de aceptación; la composición de workspace debe persistir la selección.

### Profiles

**Archivos clave:** `domain/model/entities/profile.ts`, `domain/repositories/profile.repository.ts`, `http-profile.repository.ts`, query handler y actions.

- `Profile` tiene comportamiento razonable, pero no se usa en el flujo runtime: el repository devuelve directamente `ProfileViewModel`.
- La entidad tiene timestamps y preferencias completas, mientras el view model de UI solo expone username, image, language y theme.
- El repository de dominio depende de application y la infraestructura depende de un mapper ubicado en interfaces.
- `fetchMyProfileQuery` usa caché con access token como argumento y tag global `profile`.
- Update profile invalida paths y tag; update preferences solo actualiza tag y cookie de locale.

**Plan:** elegir explícitamente entre un contexto read-oriented sin entidad o un verdadero aggregate + mapper. Mantener el segundo solo si aporta invariantes reales; de lo contrario simplificar sin conservar capas ceremoniales. Revisar caché e invalidación antes de cambiar la UI.

### Assistant

**Archivos clave:** `use-assistant-stream.ts`, `assistant-api.gateway.ts`, `assistant-conversation.transform.ts`, acciones y route handlers.

- El hook de 320 líneas representa una máquina de estados implícita: conversación activa, conversación pendiente, draft, envío, fallback síncrono, SSE, placeholder y eventos de ventana.
- El parser SSE es manual y está embebido en el hook; el gateway también tiene una ruta HTTP distinta para streaming (`fetch`) frente a `apiClient`.
- El toggle de streaming se lee tanto en `apiConfig.assistant.useStreaming` como en el hook mediante `process.env.NEXT_PUBLIC_ASSISTANT_STREAMING`.
- La creación del primer mensaje, el envío síncrono y el streaming tienen caminos distintos de sincronización y errores.
- Los tres route handlers de Assistant repiten cookies, 401 y conversión de errores.

**Plan:** extraer parser SSE y state machine puros, unificar el feature flag, encapsular commands/queries y dejar el hook como controller de UI. Añadir tests de chunks partidos, abort, error, reconexión y respuesta vacía.

### Scheduling

**Archivos clave:** `scheduling-api.gateway.ts`, acciones, `scheduling-page-data.query.service.ts`, `appointment-form-modal.tsx`, `create-appointment-form.tsx`, `reschedule-form-modal.tsx`, calendario.

- El gateway de 323 líneas tiene CRUD de citas, empleados, servicios y clientes, resolución de token, headers de tenant, URL building, schemas y errores.
- Las actions de create/update/reschedule/cancel/start/complete/no-show/delete repiten ActionState, parseo, error handling y `revalidatePath("/schedule")`.
- `AppointmentFormModal` duplica parte del formulario que ya existe en `AppointmentFormFields`/`CreateAppointmentForm`.
- `scheduling-page-data.query.service.ts` y queries hijas convierten indiscriminadamente errores en listas vacías; el usuario no distingue “sin datos” de “servicio caído”.
- El grid calcula la hora con `timeZone`, pero compara día/mes/año usando getters locales de `Date`; debe cubrirse con tests antes de refactorizar.
- Las vistas de calendario mezclan navegación, fetch, selección y permisos.

**Plan:** crear un `SchedulingApiClient`/transport mapper, separar consultas de disponibilidad de comandos de citas, consolidar formularios y modelar explícitamente `degraded` en el page model. Corregir o documentar la semántica de zona horaria con tests de cambio de día.

### Shared / UI / App shell

**Archivos clave:** `protected-app-shell.tsx`, `app-sidebar.tsx`, `app-shell-sidebar-client.tsx`, `app-shell-query.service.ts`, `entry-route-query.service.ts`, `interfaces/components/ui/*`.

- `shared/interfaces/components/ui` contiene primitives shadcn y componentes de terceros. Los archivos grandes no son todos deuda: `sidebar.tsx`, `chart.tsx`, `calendar.tsx`, etc. pueden ser unidades generadas cohesivas.
- `AppSidebar` importa Assistant, Profiles, Business y Billing; `ProtectedAppShell` carga profile, workspace y conversaciones de Assistant.
- `shared/application` importa Business y Billing, por lo que `shared` no es realmente compartido.
- Hay duplicación de error/loading/access-denied boundaries y de componentes de confirmación.
- `app/globals.css` supera 200 líneas y mezcla tokens, base y utilidades.

**Plan:** extraer shell y routing a `platform/application-shell`; conservar `shared` como kernel/UI. No partir un primitive shadcn artificialmente solo para cumplir un límite de líneas: el objetivo de 200 líneas aplica principalmente a feature/application files.

## 5. Archivos fuente de más de 200 líneas

Conteo de líneas del snapshot analizado; se excluyen `node_modules`, `.next` y `coverage`.

### App, assistant, billing, business, catalog, CRM, IAM, notifications y scheduling

| Líneas | Archivo |
|---:|---|
| 211 | `app/globals.css` |
| 320 | `contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts` |
| 236 | `contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts` |
| 284 | `contexts/billing/interfaces/components/subscribe/subscribe-view.tsx` |
| 263 | `contexts/billing/interfaces/components/invoice/invoice-view.tsx` |
| 265 | `contexts/business/interfaces/components/entity-profile-card/entity-profile-card.tsx` |
| 315 | `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx` |
| 227 | `contexts/catalog/interfaces/components/catalog/catalog-layout.tsx` |
| 204 | `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx` |
| 269 | `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx` |
| 237 | `contexts/crm/interfaces/components/customer-management/customer-form.tsx` |
| 212 | `contexts/iam/interfaces/components/verify-form.tsx` |
| 287 | `contexts/notifications/interfaces/components/notification-dropdown.tsx` |
| 323 | `contexts/scheduling/infrastructure/gateways/scheduling-api.gateway.ts` |
| 201 | `contexts/scheduling/interfaces/components/appointment-form/appointment-form-modal.tsx` |

### Primitives y componentes shared

| Líneas | Archivo |
|---:|---|
| 723 | `contexts/shared/interfaces/components/ui/sidebar.tsx` |
| 373 | `contexts/shared/interfaces/components/ui/chart.tsx` |
| 324 | `contexts/shared/interfaces/components/ui/questionnaire.tsx` |
| 312 | `contexts/shared/interfaces/components/ui/combobox.tsx` |
| 280 | `contexts/shared/interfaces/components/ui/menubar.tsx` |
| 271 | `contexts/shared/interfaces/components/ui/dropdown-menu.tsx` |
| 271 | `contexts/shared/interfaces/components/ui/context-menu.tsx` |
| 248 | `contexts/shared/interfaces/components/ui/carousel.tsx` |
| 238 | `contexts/shared/interfaces/components/ui/field.tsx` |
| 234 | `contexts/shared/interfaces/components/ui/toast.tsx` |
| 228 | `contexts/shared/interfaces/components/ui/drawer.tsx` |
| 222 | `contexts/shared/interfaces/components/ui/calendar.tsx` |
| 212 | `contexts/shared/interfaces/components/ui/select.tsx` |
| 207 | `contexts/shared/interfaces/components/ui/attachment.tsx` |
| 201 | `contexts/shared/interfaces/components/ui/item.tsx` |

### Tests de más de 200 líneas

| Líneas | Archivo |
|---:|---|
| 581 | `tests/unit/contexts/iam/interfaces/proxy.test.ts` |
| 416 | `tests/unit/contexts/business/application/business-workspace-query.service.test.ts` |
| 301 | `tests/unit/contexts/shared/application/entry-route-query.service.test.ts` |
| 274 | `tests/unit/contexts/shared/application/app-shell-query.service.test.ts` |
| 256 | `tests/unit/contexts/business/application/business-application.test.ts` |
| 243 | `tests/unit/contexts/assistant/application/internal/transforms/assistant-conversation.transform.test.ts` |
| 210 | `tests/unit/contexts/profiles/infrastructure/http-profile.repository.test.ts` |
| 201 | `tests/unit/contexts/business/domain/workspace-navigation.policy.test.ts` |

**Criterio:** dividir archivos de negocio por responsabilidad real, no por número de líneas. Los primitives generados por shadcn deben conservar cohesión salvo que mezclen aplicación/feature logic. Los tests largos deben dividirse por comportamiento después de estabilizar contratos.

## 6. Duplicaciones y consolidaciones propuestas

| Duplicación | Ubicaciones representativas | Resolución |
|---|---|---|
| `PageResponse<T>` | Assistant gateway, Billing gateway, Scheduling application, Catalog domain, CRM application | Crear un page model canónico en application/kernel; cada gateway mapea la variante del backend a ese modelo |
| Modelo de notification | `domain/model/notification.ts` y `domain/model/entities/notification.ts` | Mantener una sola definición |
| DTOs de Catalog | `application/model/catalog-view.models.ts`, `category-sidebar.tsx`, `service-detail-view.tsx` | Read models en application; componentes solo consumen tipos |
| `ActionState`/action result | CRM, Scheduling, Business y `shared/interfaces/actions/action-result.ts` | Contrato genérico compartido con errores de campo opcionales; variantes solo cuando el caso de uso lo requiera |
| Resolución de access token | IAM, Business, Catalog, Assistant, Scheduling, Billing, Profiles, Notifications y route handlers | Un único boundary server-side de sesión con estrategia explícita simple/refresh-aware |
| Cookies de sesión | `session.route.ts`, `create-session.action.ts`, `sign-out.action.ts`, proxy y actions | Centralizar persistencia, rotación, limpieza y selección de workspace |
| `tenantHeaders` y URL building | Gateways de Assistant, Catalog, CRM y Scheduling | `ApiRequestContext`/transport client que reciba token y tenant, más builders por recurso |
| Error de route handler | Business, Catalog y Billing | Adapter común para status, details y Problem Details |
| Validación de formularios HTTP | Actions y route handlers de Catalog, Business, CRM y Scheduling | Schemas en un único borde por comando; no volver a parsear el mismo objeto sin necesidad |
| Servicios passthrough | CRM command/query, IAM auth command, Catalog command, Scheduling command/query, adapters de Billing | Conservar solo si forman una fachada pública o transforman; eliminar aliases internos sin comportamiento |
| Formularios Organization/Establishment | `create-organization-form.tsx`, `create-establishment-form.tsx`, `entity-profile-card.tsx` | Primitive de campos + controller de upload + shell de submit |
| Formularios de servicios | Create/edit Catalog y secciones compartidas | Un contrato de valores/errores y secciones reutilizables |
| Formularios de clientes | `customer-form.tsx`, `edit-customer-form.tsx`, create customer | Form core con modo create/edit, manteniendo acciones distintas |
| Formularios de citas | `appointment-form-modal.tsx`, `create-appointment-form.tsx`, `reschedule-form-modal.tsx` | `AppointmentFormFields` + controller de intención create/update + shells modal/page |
| Confirmación/borrado | shared, Scheduling, Catalog, CRM y hooks de entity delete | Un primitive genérico y controllers por contexto |
| Guard de entrada | proxy, layouts, root/welcome y servicios Shared | Una policy pura + un servicio de resolución; adaptadores mínimos para cada runtime |
| Catálogo i18n y `StringLeaf` | shared y varios contextos | Un contrato genérico de diccionario; cada contexto conserva únicamente sus claves |
| Validación de nombres | Organization, Establishment y Username comparten límites/regex | Confirmar si la regla de solo letras es realmente ubicua; extraer helper solo si las invariantes son idénticas |

## 7. Estructura objetivo

### 7.1 Contextos

Cada contexto debe tener únicamente las capas que necesite:

```text
contexts/<bounded-context>/
  domain/
    model/
      entities/
      valueobjects/
      commands/
      queries/
    services/                 # policies y puertos, sin Next/HTTP/UI
  application/
    internal/
      commandservices/
      queryservices/
      outboundservices/       # ACL explícitos hacia otros contextos
    model/                    # read models y resultados serializables
    services/                 # solo contratos públicos con comportamiento
  infrastructure/
    http/                     # DTOs externos, client y response mappers
    gateways/                 # implementaciones de puertos
    repositories/
    adapters/
  interfaces/
    actions/                  # Server Actions: parse + auth + llamada + resultado
    components/               # Server/Client Components de feature
    rest/                     # schemas/resources del borde HTTP
    i18n/
  index.ts                    # API pública opcional del contexto
```

No es obligatorio mantener `internal/` cuando un contrato es realmente público. La regla importante es que `app` y otros contextos no importen paths internos profundos.

### 7.2 Plataforma y shared

```text
contexts/platform/
  application/
    shell/
    routing/
    workspace-access/
  infrastructure/
    session/
    cache/
    logging/
  interfaces/
    shell/
    errors/

contexts/shared/
  domain/                     # kernel mínimo: Locale, tipos comunes
  infrastructure/http/       # ApiClient y Problem Details
  infrastructure/i18n/       # diccionarios y cookie de locale
  interfaces/components/ui/   # primitives shadcn sin lógica de feature
  interfaces/components/      # primitives genéricos de error, page, delete
```

`platform` puede ubicarse bajo `app/_platform` si se prefiere no crear otro contexto; lo esencial es sacar el shell de la semántica de `shared` y evitar que UI compartida conozca Assistant/Profiles/Business.

### 7.3 App Router

```text
app/
  (auth)/...                  # page + composición mínima
  (protected)/...             # layouts delgados
  api/.../route.ts            # adapters HTTP delgados
  _components/                # solo composición de routing si aplica
```

Una página debe resolver parámetros, invocar una fachada de página y renderizar. Un route handler debe parsear HTTP, invocar un caso de uso y devolver la respuesta. La autorización de negocio debe vivir en application/policy, no duplicarse en cada página.

## 8. Tareas priorizadas

### P0 — proteger comportamiento y contratos

| ID | Tarea | Archivos/áreas | Criterio de salida |
|---|---|---|---|
| P0.1 | Congelar baseline y mapa de dependencias | `package.json`, CI, todos los imports | Mantener lint, 456 tests y build correctos; generar un reporte de imports cross-context |
| P0.2 | Definir contratos comunes | paginación, action result, Problem Details, scope, sesión | Contratos documentados y tests de contrato; ningún DTO de UI usado como contrato de dominio |
| P0.3 | Auditoría de autorización | todas las Server Actions y `app/api` | Matriz endpoint → autenticación → tenant → permiso; corregir cualquier endpoint que dependa solo de la autorización accidental del backend |
| P0.4 | Auditoría de caché | `fetchMyProfileQuery`, planes, tags y paths | Decisión explícita para datos públicos, por usuario y por tenant; no cachear secretos de forma accidental |
| P0.5 | Aumentar cobertura útil | `vitest.config.ts`, CI, Playwright | Cobertura de todos los contextos relevantes y workflow separado o integrado para E2E |

### P1 — plataforma, IAM y routing

| ID | Tarea | Archivos/áreas | Criterio de salida |
|---|---|---|---|
| P1.1 | Crear boundary único de sesión server-side | `iam/infrastructure/session/*`, acciones y gateways | Solo IAM conoce nombres/opciones de cookies; los contextos consumen token/sesión mediante contrato público |
| P1.2 | Separar refresh de lectura simple | `getBusinessAccessToken`, `requireIamAccessToken`, `proxy.ts` | Política simple/refresh-aware documentada; no hay resolvers locales equivalentes |
| P1.3 | Consolidar entry route | `EntryRouteQueryService`, `AppShellQueryService`, layouts, `app/page.tsx`, `welcome` | Una policy pura, una resolución coordinada y adapters para Edge/layout/page; conservar tests de proxy |
| P1.4 | Extraer application shell | `ProtectedAppShell`, `AppSidebar`, `AppShellSidebarClient` | Shell en `platform`; Shared UI no importa Assistant, Profiles, Business ni Billing |
| P1.5 | Normalizar route handlers | `app/api/business`, `catalog`, `billing`, `assistant` | Helper único de parsing/error; respuestas consistentes y handlers menores a una responsabilidad |

### P2 — account, Billing, Notifications y Assistant

| ID | Tarea | Archivos/áreas | Criterio de salida |
|---|---|---|---|
| P2.1 | Simplificar Profiles | `profiles/domain`, repository, query handler y actions | Decisión documentada entity vs read-oriented; mapper en boundary correcto; caché e invalidación probados |
| P2.2 | Separar Notifications de Workforce | modelos, factory, actions, dropdown | Un modelo; invitación tipada; controller de polling separado; persistencia de workspace fuera de la UI |
| P2.3 | Consolidar contrato de Billing | adapters, gateways, planes y subscription queries | Una fuente de verdad de planes; adapters solo si agregan ACL; acceso estricto/opcional claramente nombrado |
| P2.4 | Dividir Billing UI | `subscribe-view.tsx`, `invoice-view.tsx`, checkout/modals | Controller de checkout, plan selector, invoice list/detail y estados de error independientes |
| P2.5 | Extraer Assistant state machine | `use-assistant-stream.ts`, gateway y actions | Parser SSE puro, feature flag único, abort/error handling y sincronización testeados |

### P3 — Business, Catalog, CRM y Scheduling

| ID | Tarea | Archivos/áreas | Criterio de salida |
|---|---|---|---|
| P3.1 | Separar Business CRUD de Workspace ACL | query service, read models, policies y outbound service | Workspace expone un contrato de acceso; Organization/Establishment no contienen navegación global |
| P3.2 | Corregir dependencias de capa | domain repositories/services, mappers y schemas | Domain no importa application/interfaces; application no importa `next/headers` ni `interfaces/rest` |
| P3.3 | Consolidar Catalog read models y formularios | DTOs, sidebar/layout, create/edit forms, actions | Sin tipos duplicados; sidebar y layout solo orquestan; autorización centralizada |
| P3.4 | Normalizar CRM | customer read model, access policy, page data y forms | Eliminar segunda lectura de workspace; permisos no quedan hardcodeados como stub; alta/edición comparten core |
| P3.5 | Refactorizar Scheduling por casos de uso | gateway, acciones, page data y forms | Gateway por recurso/intención, action helper común, estados degradados explícitos y tests de timezone |

### P4 — UI, estilos y deuda residual

| ID | Tarea | Archivos/áreas | Criterio de salida |
|---|---|---|---|
| P4.1 | Revisar primitives grandes | `shared/interfaces/components/ui/*` | Dividir solo cuando exista responsabilidad independiente; conservar primitives shadcn cohesivos |
| P4.2 | Separar tokens/base CSS | `app/globals.css` | Tokens, base y utilidades identificables sin cambiar apariencia |
| P4.3 | Homogeneizar error/loading/delete | shared y route groups | Un contrato visual accesible, sin cinco variantes casi idénticas |
| P4.4 | Eliminar nombres y capas obsoletas | `standart.tsx`, aliases passthrough, exports muertos | Imports actualizados, sin archivos duplicados y sin aliases sin comportamiento |
| P4.5 | Limpieza final y documentación | todo el repositorio | Import graph conforme, tests por context, build/lint correctos y diff sin cambios funcionales no justificados |

## 9. Orden de implementación recomendado

1. **Baseline, seguridad y contratos (P0).** No comenzar dividiendo componentes: primero registrar comportamiento, permisos, caché y formas de error.
2. **IAM/session boundary (P1.1–P1.2).** Es dependencia de casi todos los contextos.
3. **Workspace ACL y entry routing (P1.3 + P3.1 parcial).** Business provee el contexto de tenant, pero la composición debe vivir en Platform.
4. **Application shell y route handlers (P1.4–P1.5).** Reducir el fan-out antes de tocar features.
5. **Profiles y Notifications/Workforce (P2.1–P2.2).** Son flujos account-level y desbloquean un shell más pequeño.
6. **Billing (P2.3–P2.4).** Su estado decide onboarding, home y acceso a Assistant.
7. **Assistant (P2.5).** Depende de sesión, workspace y acceso de Billing; refactorizarlo después de estabilizar esos contratos.
8. **Business internals (P3.1–P3.2).** Separar el agregado de workspace del CRUD sin cambiar el API externo.
9. **Catalog y CRM (P3.3–P3.4).** Ambos dependen del scope de establecimiento y se benefician del contrato de errores/paginación.
10. **Scheduling (P3.5).** Es el módulo visual y de transporte más grande; hacerlo con tests de fechas/timezones ya preparados.
11. **Shared UI/CSS y deuda residual (P4).** Solo después de retirar lógica de feature del shell y de los primitives.
12. **Validación final.** Ejecutar `bun run lint`, `bun run test`, `bun run test:coverage`, `bun run test:e2e` y `bun run build`; revisar import graph, caché, permisos y diff funcional.

## 10. Definition of Done transversal

- `app/` contiene únicamente orquestación de ruta; los route handlers no contienen lógica de dominio.
- Ningún dominio importa Next, React, browser APIs, DTOs de aplicación o componentes.
- Ninguna UI compartida importa un bounded context de negocio.
- Los contextos se comunican por fachadas/ACL documentados, no por imports profundos.
- Token, cookies, tenant scope, Problem Details, paginación y action results tienen una política única.
- Las decisiones de autorización se prueban en Server Actions/handlers y no solo en componentes cliente.
- Cada caché tiene propietario, alcance, TTL y estrategia de invalidación explícitos.
- Los errores de dependencia no se presentan como “lista vacía” sin un estado degradado modelado.
- Los archivos de feature/application se mantienen idealmente por debajo de 200 líneas; los primitives shadcn cohesivos quedan exentos de fragmentación artificial.
- Cada fase conserva lint, tests y build correctos y documenta cualquier cambio funcional intencional.
