# Assistant Frontend Chat Flow

Reference date: 2026-07-25

This document summarizes how it currently works la vista de chat del frontend de Takodu, which requests it makes, what it sends with each one y cuál es el authentication point que el backend debe esperar.

## Objetivo de la vista

The chat screen is designed como una experiencia tipo ChatGPT:

- left sidebar con previous conversations
- right main panel con la active conversation
- bottom composer for writing and sending messages
- starts in "New chat", without automatically opening an old conversation

## Startup flow

Cuando el usuario entra a `/chat`, la vista hace este orden:

1. Checks whether access is active using subscription status.
2. Si el acceso está activo, loads the sidebar list de conversaciones.
3. La pantalla starts empty, con initial assistant greeting.
4. El usuario puede empezar a escribir de inmediato.
5. If the user sends a message without having created a conversation, el frontend crea una nueva y luego envía el mensaje.

## Important authentication point

El backend must not asumir que la cookie del navegador autentica por sí sola la request.

La regla real es:

```http
Authorization: Bearer <access_token>
```

El frontend Next usa rutas locales `/api/...` como capa intermedia.  
Esas rutas leen la cookie de sesión y reenvían el `access_token` al backend en el header `Authorization`.

## Endpoints que toca la vista de chat

Base local usada por la UI:

```text
/api/assistant/conversations
```

### 1. Subscription verification

```http
GET /api/billing/subscriptions
```

Qué envía:

- sin body
- solo request GET

Para qué sirve:

- confirm that the user has active access before loading el módulo `assistant`
- en el frontend esta ruta local de Next funciona como proxy del endpoint real del backend
- el backend real expone `GET /api/billing/subscriptions`

Si el acceso no está activo:

- the UI does not make requests al módulo `assistant`
- se evita caer en errores como `403 Forbidden`

### 2. Sidebar list de conversaciones

```http
GET /api/assistant/conversations?page=0&size=20
```

Qué envía:

- query params:
  - `page`
  - `size`
  - `search` opcional si el usuario escribe en la barra lateral
- sin body

Para qué sirve:

- cargar la lista resumida de conversaciones antiguas

### 3. Conversation details

```http
GET /api/assistant/conversations/{id}
```

Qué envía:

- `id` en la URL
- sin body

Para qué sirve:

- load the full conversation con todos sus mensajes

### 4. Create a new conversation

```http
POST /api/assistant/conversations
```

Qué envía:

```json
{
  "title": "New chat"
}
```

Para qué sirve:

- create the initial conversation
- it is also used automatically cuando el usuario envía el primer mensaje sin haber seleccionado una conversación

### 5. Send a message

```http
POST /api/assistant/conversations/{id}/messages
```

Qué envía:

```json
{
  "message": "Hola"
}
```

Para qué sirve:

- save the user's message
- receive the updated conversation con la assistant response

### 6. Archive a conversation

```http
PATCH /api/assistant/conversations/{id}/archive
```

Qué envía:

- `id` en la URL
- sin body

Para qué sirve:

- remove a conversation from the active list

## Headers esperados por el backend

Toda request protegida debe salir con:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

No basta con que exista la cookie en el navegador.  
The token must be explicitly forwarded desde la capa Next al backend.

## What happens in the frontend before calling the backend

La vista de chat usa esta secuencia:

1. Comprueba acceso activo con `/api/billing/subscriptions`.
2. If access is blocked, no llama al módulo `assistant`.
3. Si el acceso está activo, loads the sidebar list.
4. If the user selects una conversación, carga el detalle.
5. Si el usuario escribe y envía, crea conversación if needed y luego manda el mensaje.

## Razones comunes de `403 Forbidden`

### Falta `Authorization`

La request llega al backend, pero no lleva:

```http
Authorization: Bearer ...
```

### Token inválido o vencido

Aunque el header exista, el backend puede rechazarlo si el token expiró o no pasa validación.

### Inactive subscription

The backend may block el acceso al módulo `assistant` si la suscripción del owner no está activa.

## Estructura esperada de datos

### Respuesta de suscripción

The verification route returns la suscripción actual y el frontend evaluates access con la policy de billing.

Campos relevantes:

- `active`
- `status`

### Conversation summary

Usada en la barra lateral.

Campos esperados:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messageCount`

### Full conversation

Usada en el panel principal.

Campos esperados:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messages`

### Mensaje

Each message includes:

- `id`
- `role`
- `content`
- `intent`
- `createdAt`

## Resumen corto para backend

- La UI arranca en modo nuevo chat.
- La barra lateral usa el listado resumido.
- El panel principal usa el detalle completo.
- El frontend must not automatically open la última conversación.
- Cada request protegida debe reenviar `Authorization: Bearer <access_token>`.
- If there is no active access, el frontend evita llamar al módulo `assistant`.
