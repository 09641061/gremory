# Assistant Backend Contrast Notes

Reference date: 2026-07-26

This short document clarifies el actual contract entre el frontend y el backend para el modulo `assistant`, with a focus on autenticacion, paginacion y acceso por workspace.

## 1. Authentication

El backend protege las rutas del API con JWT y espera el token en el header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Puntos clave:

- las cookies del navegador no autentican por si solas el API
- si el frontend usa Next como capa intermedia, esa capa debe reenviar el `access_token` en `Authorization`
- si el token falta, esta vencido o no pasa validacion, el backend puede responder `401` o `403`

## 2. Rutas reales del `assistant`

Base path:

```text
/api/assistant/conversations
```

### Sidebar list

```http
GET /api/assistant/conversations?page=0&size=20
```

Respuesta real:

- Spring `Page`
- campos importantes:
  - `content`
  - `pageable`
  - `totalElements`
  - `totalPages`
  - `first`
  - `last`

Cada item de `content` es un resumen con:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messageCount`

### Conversation details

```http
GET /api/assistant/conversations/{id}
```

Returns the full conversation with:

- `messages`
- historial completo del chat

### Create conversation

```http
POST /api/assistant/conversations
```

Body:

```json
{
  "title": "New chat"
}
```

Respuesta esperada:

- the created conversation en formato completo
- incluye `messages` vacio o inicial
- incluye los campos de resumen:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

### Send message

```http
POST /api/assistant/conversations/{id}/messages
```

Body:

```json
{
  "message": "Hola"
}
```

Respuesta esperada:

- the updated conversation
- incluye la version mas reciente de `messages`
- incluye los campos de resumen actualizados:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

### Archive conversation

```http
PATCH /api/assistant/conversations/{id}/archive
```

Sin body.

Respuesta esperada:

- the archived conversation
- el frontend usa la respuesta para quitarla del listado activo
- idealmente devuelve al menos:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

## 3. Subscription / access

The correct route for querying la suscripcion actual es:

```http
GET /api/billing/subscriptions
```

No existe en el backend una ruta `GET /api/billing/subscription/status`.

La respuesta real del backend incluye, entre otros:

- `status`
- `active`
- `planId`
- `billingCycle`
- `currentPeriodStart`
- `currentPeriodEnd`
- `failedAttemptsCount`

La UI puede usar esta respuesta para billing o para mostrar el estado del plan, pero no para decidir el acceso al chat.

## 4. Recommended flow de la UI

1. Obtener el `access_token` de la sesion actual.
2. Llamar `GET /api/business/workspace` para decidir si el usuario puede entrar al chat.
3. Si `accessPolicy.canUseAssistant === true`, llamar `GET /api/assistant/conversations?page=0&size=20`.
4. Al abrir una conversacion, llamar `GET /api/assistant/conversations/{id}`.
5. Al enviar un mensaje, llamar `POST /api/assistant/conversations/{id}/messages`.
6. If the user wants to start another chat, crear una nueva conversacion con `POST /api/assistant/conversations`.
7. Si una pantalla explicita de billing necesita mostrar el plan, usar `GET /api/billing/subscriptions` como complemento.

## 5. Causas comunes de `403 Forbidden`

### Falta `Authorization`

El request llega al backend pero no lleva el header bearer.

### Token invalido o vencido

El backend no puede autenticar la request.

### No assistant access in workspace

El workspace puede bloquear el acceso al chat si `accessPolicy.canUseAssistant` es `false`.

### Next no reenvia el token

Si el browser llama una ruta local de Next y Next llama al backend, esa ruta intermedia debe reenviar el token en `Authorization`.

## 6. Lo que el frontend must not asumir

- que las cookies autentican el backend por si solas
- que `/api/billing/subscription/status` existe
- que `GET /api/assistant/conversations` devuelve un array plano
- que la barra lateral debe abrir automaticamente la ultima conversacion
- que archivar es borrar fisicamente

## 7. Regla rapida para evitar errores

Toda request protegida debe salir con:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Y la UI debe usar:

- `GET /api/business/workspace` para decidir acceso al chat
- `GET /api/billing/subscriptions` solo para enriquecer pantallas de billing o plan
- `GET /api/assistant/conversations` para sidebar
- `GET /api/assistant/conversations/{id}` para chat completo
- `POST /api/assistant/conversations/{id}/messages` para enviar mensajes

## 8. Resumen corto para frontend

- Usa el header `Authorization` siempre.
- Usa `GET /api/business/workspace` para validar acceso al chat.
- Usa `GET /api/billing/subscriptions` solo si necesitas mostrar el plan.
- Usa `Page.content` para la barra lateral.
- Usa `GET /api/assistant/conversations/{id}` para el panel principal.
- No dependas de cookies para autenticar el API.
- Si aparece `403`, first check token y suscripcion activa.

## 9. Cambios a implementar en frontend

1. When a new conversation is created una conversacion nueva, assume it may return con un mensaje inicial del asistente y no con `messages` vacio.
2. En la validacion de acceso, usar principalmente `accessPolicy.canUseAssistant` de `GET /api/business/workspace`.
3. Tratar el listado lateral como una respuesta paginada Spring `Page`, no como un array plano.
4. Mantener `Authorization: Bearer <access_token>` en todas las requests protegidas, incluso si ya existen cookies de sesion.
5. Al abrir una conversacion, cargar el detalle completo con `GET /api/assistant/conversations/{id}` instead of reusing el resumen lateral.
6. Al enviar un mensaje, refresh the state de la conversacion con la respuesta devuelta por el backend para keep synchronized `messages`, `updatedAt` y `lastMessageAt`.
7. Si el backend responde `403`, first interpret a missing header, token vencido o falta de `canUseAssistant` before assuming a UI failure.
