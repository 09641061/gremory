# Assistant API Contract

Fecha de referencia: 2026-07-26

| Endpoint | Método | Header requerido | Query / Params | Body | Devuelve |
|---|---|---|---|---|---|
| `/api/assistant/conversations` | `GET` | `Authorization: Bearer <access_token>` | `page` opcional, `size` opcional, `search` opcional | No | Página con resúmenes de conversaciones |
| `/api/assistant/conversations/{id}` | `GET` | `Authorization: Bearer <access_token>` | `id` en la ruta | No | Conversación completa con mensajes |
| `/api/assistant/conversations` | `POST` | `Authorization: Bearer <access_token>` | No | `{ "title": "Nuevo chat" }` | Conversación creada con mensaje inicial |
| `/api/assistant/conversations/{id}/messages` | `POST` | `Authorization: Bearer <access_token>` | `id` en la ruta | `{ "message": "..." }` | Conversación actualizada con respuesta del assistant |
| `/api/assistant/conversations/{id}/archive` | `PATCH` | `Authorization: Bearer <access_token>` | `id` en la ruta | No | Conversación archivada |

## Ejemplos

### GET /api/assistant/conversations

Request:

```http
GET /api/assistant/conversations?page=0&size=20&search=nue
Authorization: Bearer <access_token>
```

Response:

```json
{
  "content": [
    {
      "id": "55516e31-f55e-4cf7-aabc-3304881cc169",
      "title": "Nuevo chat",
      "status": "ACTIVE",
      "createdAt": "2026-07-25T20:23:59.1612253-05:00",
      "updatedAt": "2026-07-25T20:24:02.7462948-05:00",
      "lastMessageAt": "2026-07-25T20:24:02.7462948-05:00",
      "messageCount": 3
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### GET /api/assistant/conversations/{id}

Request:

```http
GET /api/assistant/conversations/55516e31-f55e-4cf7-aabc-3304881cc169
Authorization: Bearer <access_token>
```

Response:

```json
{
  "id": "55516e31-f55e-4cf7-aabc-3304881cc169",
  "title": "Nuevo chat",
  "status": "ACTIVE",
  "createdAt": "2026-07-25T20:23:59.1612253-05:00",
  "updatedAt": "2026-07-25T20:24:02.7462948-05:00",
  "lastMessageAt": "2026-07-25T20:24:02.7462948-05:00",
  "messages": [
    {
      "id": "789631bc-b2f7-4eee-bf14-6e9123080c72",
      "role": "ASSISTANT",
      "content": "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
      "intent": "HELP",
      "createdAt": "2026-07-25T20:23:59.1612253-05:00"
    }
  ]
}
```

### POST /api/assistant/conversations

Request:

```http
POST /api/assistant/conversations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Nuevo chat"
}
```

Response:

```json
{
  "id": "55516e31-f55e-4cf7-aabc-3304881cc169",
  "title": "Nuevo chat",
  "status": "ACTIVE",
  "createdAt": "2026-07-25T20:23:59.1612253-05:00",
  "updatedAt": "2026-07-25T20:23:59.1612253-05:00",
  "lastMessageAt": "2026-07-25T20:23:59.1612253-05:00",
  "messages": [
    {
      "id": "789631bc-b2f7-4eee-bf14-6e9123080c72",
      "role": "ASSISTANT",
      "content": "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
      "intent": "HELP",
      "createdAt": "2026-07-25T20:23:59.1612253-05:00"
    }
  ]
}
```

### POST /api/assistant/conversations/{id}/messages

Request:

```http
POST /api/assistant/conversations/55516e31-f55e-4cf7-aabc-3304881cc169/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "dame la cantidad de servicios tengo en catalogo"
}
```

Response:

```json
{
  "id": "55516e31-f55e-4cf7-aabc-3304881cc169",
  "title": "Nuevo chat",
  "status": "ACTIVE",
  "createdAt": "2026-07-25T20:23:59.1612253-05:00",
  "updatedAt": "2026-07-25T20:24:02.7462948-05:00",
  "lastMessageAt": "2026-07-25T20:24:02.7462948-05:00",
  "messages": [
    {
      "id": "789631bc-b2f7-4eee-bf14-6e9123080c72",
      "role": "ASSISTANT",
      "content": "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
      "intent": "HELP",
      "createdAt": "2026-07-25T20:23:59.1612253-05:00"
    },
    {
      "id": "dda3d1be-1387-4886-81c6-0df133266558",
      "role": "USER",
      "content": "dame la cantidad de servicios tengo en catalogo",
      "intent": "GENERAL",
      "createdAt": "2026-07-25T20:24:01.083227-05:00"
    },
    {
      "id": "7946e70b-9a0c-443c-a3af-36da45bd59c9",
      "role": "ASSISTANT",
      "content": "Tienes 2 servicios registrados en tu catálogo: \"awa de owo\" y \"servico1\".",
      "intent": "CATALOG",
      "createdAt": "2026-07-25T20:24:02.7462948-05:00"
    }
  ]
}
```

### PATCH /api/assistant/conversations/{id}/archive

Request:

```http
PATCH /api/assistant/conversations/55516e31-f55e-4cf7-aabc-3304881cc169/archive
Authorization: Bearer <access_token>
```

Response:

```json
{
  "id": "55516e31-f55e-4cf7-aabc-3304881cc169",
  "title": "Nuevo chat",
  "status": "ARCHIVED",
  "createdAt": "2026-07-25T20:23:59.1612253-05:00",
  "updatedAt": "2026-07-25T20:25:00.0000000-05:00",
  "lastMessageAt": "2026-07-25T20:24:02.7462948-05:00",
  "messages": [
    {
      "id": "789631bc-b2f7-4eee-bf14-6e9123080c72",
      "role": "ASSISTANT",
      "content": "Hola. Soy tu asistente para negocio, clientes, catálogo y agenda.",
      "intent": "HELP",
      "createdAt": "2026-07-25T20:23:59.1612253-05:00"
    }
  ]
}
```
