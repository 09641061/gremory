# Plan de limpieza y refactorización

Objetivo: limpiar la base actual sin cambiar el comportamiento funcional.

## Criterios transversales
- Mantener **Next.js App Router** con layouts, loading y error boundaries delgadas.
- Dejar `contexts/shared/interfaces/components/ui` como **primitivas shadcn**; la lógica de negocio/composición vive fuera de `ui/`.
- Eliminar capas que solo re-exportan tipos o delegan sin aportar valor.
- Después del refactor, **ningún archivo debe superar 200 líneas**.

## 1) Plataforma Next.js / shell

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `proxy.ts`, `app/layout.tsx`, `app/(protected)/(app)/layout.tsx`, `app/(protected)/(configuration)/layout.tsx` | Guards, selección de workspace, lectura de cookies/headers y resolución de entrada están mezclados en la capa de routing. | Extraer la política de entrada a servicios puros y dejar layouts/proxy como orquestadores mínimos. | Alta |
| `app/(protected)/(app)/chat/page.tsx`, `app/(protected)/(app)/welcome/page.tsx` | Copia de fallback/denied-state y composición de shell mezcladas con lógica de navegación. | Crear wrappers reutilizables para estados de acceso/servicio no disponible y dejar las páginas como contenedores. | Alta |
| `app/globals.css` | Tokens, base, componentes y utilidades de layout están juntos. | Separar tokens/base/componentes en capas o archivos menores sin tocar el tema visual. | Media |
| `app/(protected)/(app)/analytics/page.tsx`, `app/(protected)/(app)/team/page.tsx`, `app/(protected)/(status)/*` | Páginas de estado/shell con responsabilidades heterogéneas. | Normalizar la estructura de páginas con componentes de presentación pequeños y una sola responsabilidad por archivo. | Media |

## 2) Assistant

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts` | Hook monolítico: streaming SSE, sincronización entre tabs, creación de conversación y fallback están en el mismo archivo. | Separar parser/stream state machine, sincronización de eventos y helpers de URL/conversación. | Alta |
| `contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts` | Gateway largo con repetición de request/response handling. | Extraer builder de requests y agrupar endpoints por caso de uso. | Alta |
| `contexts/assistant/interfaces/components/chat-view/assistant-chat-view.tsx`, `assistant-chat-composer.tsx`, `assistant-chat-thread.tsx`, `assistant-chat-message-bubble.tsx` | Vista y subcomponentes todavía concentran orquestación, estado y presentación. | Partir la vista en contenedores y componentes puros; dejar el estado en hooks dedicados. | Media |
| `contexts/assistant/interfaces/components/sidebar/use-assistant-conversation-sidebar*.ts`, `assistant-conversation-list.tsx`, `assistant-conversation-list-item.tsx` | Lógica de sidebar, mutaciones y UI compartidas entre varios archivos. | Unificar el contrato de sidebar y reducir el número de hooks puente. | Media |
| `app/api/assistant/conversations/route.ts`, `app/api/assistant/conversations/[id]/route.ts`, `app/api/assistant/conversations/[id]/messages/route.ts` | Handlers repetitivos que deberían ser thin adapters. | Centralizar validación, mapeo de errores y acceso a gateway en utilidades compartidas del contexto. | Media |

## 3) Billing

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/billing/interfaces/components/subscribe/subscribe-view.tsx` | Mezcla metadata de planes, confirmación, pago, feedback y selección de moneda/ciclo. | Separar un view-model de planes, un controller de checkout y un componente de pantalla. | Alta |
| `contexts/billing/interfaces/components/invoice/invoice-view.tsx` | Pantalla de facturas con fetch cliente, paginación, tabla, detalles y cancelación en el mismo archivo. | Extraer paginación/fetch y modales a componentes/hook propios. | Alta |
| `contexts/billing/interfaces/components/checkout/checkout-form.tsx`, `payment-modal.tsx`, `invoice-detail-modal.tsx`, `cancel/cancel-subscription-modal.tsx` | Flujos de pago y confirmación muy acoplados. | Unificar shell de modal y separar pasos/estados de Stripe y confirmación. | Alta |
| `contexts/billing/infrastructure/gateways/billing-api.gateway.ts` | Gateway con demasiadas variantes de endpoint y parsing repetido. | Factorizar helper de requests y serialización de moneda/plan. | Media |
| `contexts/billing/interfaces/components/icons/standart.tsx` | Nombre inconsistente/typo. | Renombrar a `standard.tsx` y actualizar imports. | Media |
| `app/(protected)/invoice/page.tsx`, `app/(protected)/upgrade/page.tsx`, `app/api/billing/*/route.ts` | Páginas y handlers de billing deben seguir siendo adapters delgados. | Mantenerlas como composición mínima sobre servicios del contexto. | Media |

## 4) Business

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/business/interfaces/components/entity-profile-card/entity-profile-card.tsx` | Editor genérico con reset de estado, upload, validación, permisos y submit en un solo archivo. | Extraer shell del formulario, control de archivo y sincronización de props a subcomponentes/hooks. | Alta |
| `contexts/business/application/internal/queryservices/business-workspace-query.service.ts` | Mapeo grande entre recurso backend y view-model de workspace/permissions/capabilities. | Dividir en mappers puros (`organization`, `establishment`, `access-policy`) y dejar el service como orquestador. | Alta |
| `contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form.tsx`, `contexts/business/interfaces/components/organization/create-organization/create-organization-form.tsx` | Formularios grandes con validación, selección de tiempo y submit mezclados. | Extraer schema/validation, campos reutilizables y shell de submit. | Media |
| `contexts/business/interfaces/components/establishment/establishments-page/establishments-page.tsx`, `contexts/business/interfaces/components/organization/organizations-page/organizations-page.tsx` | Páginas de dominio con demasiada composición y estado local. | Reducirlas a contenedores y mover filtros/listado/búsqueda a bloques pequeños. | Media |
| `contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher.tsx`, `workspace-avatar.tsx`, `organization-badge.tsx` | Componentes de workspace correctos pero con riesgo de crecer por lógica de selección. | Mantenerlos presentacionales y mover reglas de selección/cancelación a policies. | Baja |
| `app/api/business/workspace/route.ts`, `app/api/business/organizations/*/route.ts`, `app/api/business/establishments/*/route.ts` | Handlers por recurso todavía deben mantenerse thin. | Compartir validación, errores y mapeo de DTOs entre route handlers. | Media |

## 5) Catalog

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/catalog/interfaces/components/catalog/category-sidebar.tsx` | Sidebar muy grande: drag & drop, sheet móvil, empty state, acciones y navegación. | Separar controller de drag/drop, panel móvil y lista de categorías/servicios. | Alta |
| `contexts/catalog/interfaces/components/catalog/catalog-layout.tsx` | Orquesta creación/edición, optimistic overrides y selección de entidad. | Mover estado de selección/optimismo a un hook y dejar el layout como composición. | Alta |
| `contexts/catalog/interfaces/components/catalog/edit-service-form.tsx`, `create-service/create-service-form.tsx`, `financials-and-logistics-section.tsx`, `general-info-section.tsx`, `instructions-section.tsx` | Formularios por secciones con responsabilidad mezclada y probable duplicación. | Consolidar un formulario base de servicio y secciones reutilizables. | Alta |
| `contexts/catalog/interfaces/components/catalog/category-item.tsx`, `service-row.tsx`, `service-detail-view.tsx` | Presentación y reglas de interacción repartidas entre varios componentes. | Normalizar contratos de item/row/detail y dejar solo UI en cada uno. | Media |
| `contexts/catalog/interfaces/actions/manage-catalog-service.actions.ts`, `manage-service-category.actions.ts`, `create-catalog-service.action.ts` | Acciones CRUD duplicadas o muy cercanas. | Unificar helpers de acción/validación y reducir wrappers redundantes. | Media |
| `app/api/catalog/categories/*/route.ts`, `app/api/catalog/services/*/route.ts` | Handlers repetidos por recurso. | Centralizar parsing, errores y autorización en helpers del contexto. | Media |

## 6) CRM

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/crm/interfaces/components/customer-directory/crm-client-wrapper.tsx` | Wrapper de cliente con demasiada orquestación de pantalla. | Convertirlo en contenedor mínimo y mover lógica de estado a hooks/view-models. | Media |
| `contexts/crm/interfaces/components/customer-management/customer-form.tsx`, `edit-customer-form.tsx` | Formularios duplican validación, estado y normalización de datos. | Crear un núcleo compartido de formulario cliente/edición. | Alta |
| `contexts/crm/interfaces/actions/resolve-document.action.ts` | Repite lookup de workspace y mezcla autorización con integración externa. | Introducir un service dedicado para verificación de documento y autorización. | Media |
| `contexts/crm/application/internal/commandservices/crm-command.service.ts`, `crm-query.service.ts` | Capas de aplicación con responsabilidades muy próximas y naming poco uniforme. | Normalizar la capa de aplicación y eliminar puentes innecesarios. | Media |
| `contexts/crm/interfaces/components/customer-management/phone-input.tsx` | Componente utilitario que puede quedar aislado pero debe seguir sin crecer. | Mantenerlo como input atómico y extraer helpers compartidos si aparecen más usos. | Baja |
| `app/(protected)/(app)/crm/page.tsx`, `app/(protected)/(app)/crm/new/page.tsx`, `app/(protected)/(app)/crm/[customerId]/edit/page.tsx` | Páginas deben ser adaptadores finos sobre el contexto. | Mantenerlas sin lógica de negocio adicional. | Media |

## 7) IAM

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/iam/interfaces/components/verify-form.tsx`, `auth-form.tsx`, `verify.tsx`, `auth-callback.tsx` | Flujos auth/magic-link/callback repartidos entre varias piezas. | Consolidar un flujo de autenticación por intención y extraer estado compartido. | Alta |
| `contexts/iam/infrastructure/gateways/iam-api.gateway.ts`, `iam-refresh-coordinator.ts`, `iam-session-cookie.ts` | Orquestación de sesión/refresh/cookies muy cercana y difícil de seguir. | Separar coordinación de sesión, persistencia de cookies y llamadas remotas. | Alta |
| `contexts/iam/application/internal/queryservices/iam-session-query.service.ts`, `contexts/iam/application/services/iam-session-query.service.ts` | Capas de servicio que pueden estar duplicando el contrato. | Dejar una única fuente de verdad por contrato y eliminar aliases tipo passthrough. | Media |
| `app/(auth)/login/page.tsx`, `app/(auth)/auth/verify/page.tsx`, `app/auth/callback/page.tsx`, `app/api/iam/auth/session/route.ts` | La capa de routing auth debe permanecer mínima. | Mantener pages/route handlers como adapters y mover reglas a application/services. | Media |
| `proxy.ts` | La política de auth/redirect vive mezclada con workspace selection. | Mantenerlo como edge guard y mover reglas complejas fuera del proxy. | Alta |

## 8) Notifications

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/notifications/domain/model/entities/notification.ts`, `contexts/notifications/domain/model/notification.ts` | Modelos duplicados idénticos. | Eliminar uno y dejar un único contrato de dominio. | Alta |
| `contexts/notifications/application/services/notification-command.service.ts`, `notification-query.service.ts` | Son solo aliases de tipo sobre la capa de dominio. | Eliminar capas passthrough si no agregan comportamiento. | Alta |
| `contexts/notifications/interfaces/components/notification-dropdown.tsx` | Dropdown monolítico: polling, paginación, rendering y acciones. | Partirlo en hook de polling, lista de notificaciones y toolbar/paginación. | Alta |
| `contexts/notifications/interfaces/actions/notification.actions.ts` | Repite auth/error handling y persistencia de workspace. | Extraer helpers comunes para token, errores esperados y persistencia. | Media |
| `contexts/notifications/interfaces/components/accept-pending-invitation-button.tsx` | Debe alinearse con el resto del flujo de invitaciones. | Revisar si puede compartir contrato/UI con el dropdown. | Baja |

## 9) Profiles

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/profiles/interfaces/components/profile/profile-card.tsx`, `profile-preferences-card.tsx`, `sidebar-profile.tsx` | La estructura es razonable, pero puede crecer rápido si se mezclan datos y UI. | Mantener componentes presentacionales y extraer mappers si aparecen más variantes. | Baja |
| `contexts/profiles/interfaces/rest/mappers/profile.mapper.ts`, `profile.schemas.ts` | Nombres y responsabilidades cercanas al borde HTTP. | Unificar naming y dejar claro qué es DTO, schema y view-model. | Baja |
| `contexts/profiles/infrastructure/repositories/http-profile.repository.ts` | Repositorio HTTP debe seguir siendo un adaptador puro. | Mantener sin lógica de pantalla ni validación adicional. | Baja |
| `app/(protected)/(configuration)/profile/page.tsx` | Página de configuración debe ser thin. | Dejarla como composición mínima sobre el contexto. | Baja |

## 10) Scheduling

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/scheduling/infrastructure/gateways/scheduling-api.gateway.ts` | Gateway muy repetitivo con builders de URL y métodos casi iguales. | Extraer helper de request/endpoint y agrupar mutaciones por intención. | Alta |
| `contexts/scheduling/interfaces/components/appointment-form/appointment-form-modal.tsx`, `reschedule-form-modal.tsx`, `appointment-form-fields.tsx`, `create-appointment-form.tsx` | Modales, campos y estado de formulario están demasiado entrelazados. | Separar shell de modal, campos y lógica de submit/validation. | Alta |
| `contexts/scheduling/interfaces/components/appointment-detail/appointment-detail-modal.tsx`, `appointment-detail-actions.tsx`, `appointment-detail-utils.ts` | Detalle de cita mezcla UI, helpers y acciones. | Mover utilidades a helpers puros y dejar acciones UI en subcomponentes. | Media |
| `contexts/scheduling/interfaces/components/calendar/daily-staff-calendar.tsx`, `daily-staff-grid.tsx`, `calendar-toolbar.tsx` | Calendario con demasiada responsabilidad visual y de interacción. | Separar grid, toolbar y render de bloques en piezas más pequeñas. | Media |
| `contexts/scheduling/interfaces/components/scheduling-timezone.utils.ts`, `use-now.ts` | Utilidades/hook colocados en carpetas de UI y con alcance dudoso. | Reubicar a helpers compartidos si se usan fuera del módulo. | Baja |
| `app/(protected)/(app)/schedule/page.tsx`, `app/(protected)/(app)/schedule/new/page.tsx`, `app/api/*` | Páginas/handlers deben seguir siendo adapters delgados. | Mantener la capa de ruta mínima y empujar la complejidad al contexto. | Media |

## 11) Shared / shadcn UI

| Archivos | Problema detectado | Acción recomendada | Prioridad |
|---|---|---|---|
| `contexts/shared/interfaces/components/ui/sidebar.tsx`, `chart.tsx`, `questionnaire.tsx`, `combobox.tsx`, `menubar.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `carousel.tsx`, `field.tsx`, `toast.tsx`, `drawer.tsx`, `calendar.tsx`, `select.tsx`, `attachment.tsx`, `item.tsx` | Primitivas shadcn demasiado grandes y con composición/app logic mezcladas. | Mantener `ui/` como base genérica, partir archivos monolíticos y mover comportamientos específicos a capas de feature. | Alta |
| `contexts/shared/interfaces/components/delete-confirm-dialog.tsx`, `shared/interfaces/components/error.tsx`, `image-upload-avatar.tsx`, `searchable-options.tsx`, `entity-list-row.tsx`, `page-shell.tsx`, `protected-app-shell.tsx`, `app-sidebar.tsx`, `app-shell-sidebar-client.tsx` | Componentes compartidos con alta probabilidad de acumular responsabilidad transversal. | Extraer subcomponentes y hooks, y evitar que actúen como contenedores de dominio. | Alta |
| `contexts/shared/application/internal/queryservices/entry-route-query.service.ts`, `plan-home-route-query.service.ts`, `app-shell-query.service.ts`, `module-access.policy.ts` | Buen lugar para centralizar políticas, pero hay riesgo de capa intermedia innecesaria. | Revisar aliases, normalizar naming y mantener solo servicios con comportamiento real. | Media |
| `contexts/shared/infrastructure/i18n/locales/{en.ts,es.ts}`, `shared/interfaces/i18n/*` | i18n federado correcto, pero conviene evitar duplicación de catálogos y helpers. | Consolidar contratos/dictionaries y mantener una sola fuente por locale. | Baja |

## Orden sugerido de ejecución
1. `shared/ui` + `notifications` + `assistant` + `billing`.
2. `catalog` + `business` + `scheduling`.
3. `iam` + `crm` + `profiles`.
4. Ajuste final de `app/` y `proxy.ts`.
