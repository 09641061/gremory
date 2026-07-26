# Assistant Backend Contrast Notes

Fecha de referencia: 2026-07-26

Este mini documento aclara el contrato real entre el frontend y el backend para el modulo `assistant`, con foco en autenticacion, paginacion y flujo de suscripcion.

## 1. Autenticacion

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

### Listado lateral

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

### Detalle de conversacion

```http
GET /api/assistant/conversations/{id}
```

Devuelve la conversacion completa con:

- `messages`
- historial completo del chat

### Crear conversacion

```http
POST /api/assistant/conversations
```

Body:

```json
{
  "title": "Nuevo chat"
}
```

Respuesta esperada:

- la conversacion creada en formato completo
- incluye `messages` vacio o inicial
- incluye los campos de resumen:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

### Enviar mensaje

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

- la conversacion actualizada
- incluye la version mas reciente de `messages`
- incluye los campos de resumen actualizados:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

### Archivar conversacion

```http
PATCH /api/assistant/conversations/{id}/archive
```

Sin body.

Respuesta esperada:

- la conversacion archivada
- el frontend usa la respuesta para quitarla del listado activo
- idealmente devuelve al menos:
  - `id`
  - `title`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `lastMessageAt`

## 3. Suscripcion / acceso

La ruta correcta para consultar la suscripcion actual es:

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

La UI puede considerar acceso valido cuando:

- `active === true`
- `status === "ACTIVE"`

## 4. Flujo recomendado de la UI

1. Obtener el `access_token` de la sesion actual.
2. Llamar `GET /api/billing/subscriptions` para decidir si el usuario puede entrar al chat.
3. Si el acceso esta activo, llamar `GET /api/assistant/conversations?page=0&size=20`.
4. Al abrir una conversacion, llamar `GET /api/assistant/conversations/{id}`.
5. Al enviar un mensaje, llamar `POST /api/assistant/conversations/{id}/messages`.
6. Si el usuario quiere iniciar otro chat, crear una nueva conversacion con `POST /api/assistant/conversations`.

## 5. Causas comunes de `403 Forbidden`

### Falta `Authorization`

El request llega al backend pero no lleva el header bearer.

### Token invalido o vencido

El backend no puede autenticar la request.

### Suscripcion no activa

El `SubscriptionAccessFilter` bloquea el acceso si la suscripcion del owner no esta activa.

### Next no reenvia el token

Si el browser llama una ruta local de Next y Next llama al backend, esa ruta intermedia debe reenviar el token en `Authorization`.

## 6. Lo que el frontend no debe asumir

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

- `GET /api/billing/subscriptions` para acceso
- `GET /api/assistant/conversations` para sidebar
- `GET /api/assistant/conversations/{id}` para chat completo
- `POST /api/assistant/conversations/{id}/messages` para enviar mensajes

## 8. Resumen corto para frontend

- Usa el header `Authorization` siempre.
- Usa `GET /api/billing/subscriptions` para validar acceso.
- Usa `Page.content` para la barra lateral.
- Usa `GET /api/assistant/conversations/{id}` para el panel principal.
- No dependas de cookies para autenticar el API.
- Si aparece `403`, primero revisa token y suscripcion activa.

## 9. Cambios a implementar en frontend

1. Cuando se cree una conversacion nueva, asumir que puede regresar con un mensaje inicial del asistente y no con `messages` vacio.
2. En la validacion de acceso, usar principalmente `active` y `status === "ACTIVE"` de `GET /api/billing/subscriptions`.
3. Tratar el listado lateral como una respuesta paginada Spring `Page`, no como un array plano.
4. Mantener `Authorization: Bearer <access_token>` en todas las requests protegidas, incluso si ya existen cookies de sesion.
5. Al abrir una conversacion, cargar el detalle completo con `GET /api/assistant/conversations/{id}` en lugar de reutilizar el resumen lateral.
6. Al enviar un mensaje, refrescar el estado de la conversacion con la respuesta devuelta por el backend para mantener sincronizados `messages`, `updatedAt` y `lastMessageAt`.
7. Si el backend responde `403`, interpretar primero falta de header, token vencido o suscripcion inactiva antes de asumir un fallo de UI.
