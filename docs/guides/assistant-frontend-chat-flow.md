# Assistant Frontend Chat Flow

Fecha de referencia: 2026-07-25

Este documento resume cómo está funcionando hoy la vista de chat del frontend de Takodu, qué peticiones hace, qué envía en cada una y cuál es el punto de autenticación que el backend debe esperar.

## Objetivo de la vista

La pantalla de chat está pensada como una experiencia tipo ChatGPT:

- barra lateral izquierda con conversaciones anteriores
- panel principal derecho con la conversación activa
- composer inferior para escribir y enviar mensajes
- arranque en modo "Nuevo chat", sin abrir automáticamente una conversación vieja

## Flujo de arranque

Cuando el usuario entra a `/chat`, la vista hace este orden:

1. Verifica si hay acceso activo usando el estado de suscripción.
2. Si el acceso está activo, carga el listado lateral de conversaciones.
3. La pantalla arranca vacía, con saludo inicial del asistente.
4. El usuario puede empezar a escribir de inmediato.
5. Si envía un mensaje sin haber creado conversación, el frontend crea una nueva y luego envía el mensaje.

## Punto importante de autenticación

El backend no debe asumir que la cookie del navegador autentica por sí sola la request.

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

### 1. Verificación de suscripción

```http
GET /api/billing/subscriptions
```

Qué envía:

- sin body
- solo request GET

Para qué sirve:

- confirmar si el usuario tiene acceso activo antes de cargar el módulo `assistant`
- en el frontend esta ruta local de Next funciona como proxy del endpoint real del backend
- el backend real expone `GET /api/billing/subscriptions`

Si el acceso no está activo:

- la UI no dispara requests al módulo `assistant`
- se evita caer en errores como `403 Forbidden`

### 2. Listado lateral de conversaciones

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

### 3. Detalle de una conversación

```http
GET /api/assistant/conversations/{id}
```

Qué envía:

- `id` en la URL
- sin body

Para qué sirve:

- cargar la conversación completa con todos sus mensajes

### 4. Crear una conversación nueva

```http
POST /api/assistant/conversations
```

Qué envía:

```json
{
  "title": "Nuevo chat"
}
```

Para qué sirve:

- crear la conversación inicial
- también se usa automáticamente cuando el usuario envía el primer mensaje sin haber seleccionado una conversación

### 5. Enviar un mensaje

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

- guardar el mensaje del usuario
- recibir la conversación actualizada con la respuesta del asistente

### 6. Archivar una conversación

```http
PATCH /api/assistant/conversations/{id}/archive
```

Qué envía:

- `id` en la URL
- sin body

Para qué sirve:

- sacar una conversación del listado activo

## Headers esperados por el backend

Toda request protegida debe salir con:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

No basta con que exista la cookie en el navegador.  
El token debe reenviarse explícitamente desde la capa Next al backend.

## Qué pasa en el frontend antes de llamar al backend

La vista de chat usa esta secuencia:

1. Comprueba acceso activo con `/api/billing/subscriptions`.
2. Si el acceso está bloqueado, no llama al módulo `assistant`.
3. Si el acceso está activo, carga el listado lateral.
4. Si el usuario selecciona una conversación, carga el detalle.
5. Si el usuario escribe y envía, crea conversación si hace falta y luego manda el mensaje.

## Razones comunes de `403 Forbidden`

### Falta `Authorization`

La request llega al backend, pero no lleva:

```http
Authorization: Bearer ...
```

### Token inválido o vencido

Aunque el header exista, el backend puede rechazarlo si el token expiró o no pasa validación.

### Suscripción no activa

El backend puede bloquear el acceso al módulo `assistant` si la suscripción del owner no está activa.

## Estructura esperada de datos

### Respuesta de suscripción

La ruta de verificación devuelve la suscripción actual y el frontend evalúa acceso con la policy de billing.

Campos relevantes:

- `active`
- `status`

### Conversación resumida

Usada en la barra lateral.

Campos esperados:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messageCount`

### Conversación completa

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

Cada mensaje incluye:

- `id`
- `role`
- `content`
- `intent`
- `createdAt`

## Resumen corto para backend

- La UI arranca en modo nuevo chat.
- La barra lateral usa el listado resumido.
- El panel principal usa el detalle completo.
- El frontend no debe abrir automáticamente la última conversación.
- Cada request protegida debe reenviar `Authorization: Bearer <access_token>`.
- Si no hay acceso activo, el frontend evita llamar al módulo `assistant`.
