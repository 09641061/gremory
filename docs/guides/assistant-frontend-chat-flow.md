# Assistant Frontend Chat Flow

Reference date: 2026-07-25

This document summarizes how the frontend chat view works, which requests it makes, and which backend signal is the real access gate.

## Objective

The chat screen is designed like a ChatGPT-style experience:

- left sidebar with previous conversations
- right main panel with the active conversation
- bottom composer for writing and sending messages
- starts in "New chat", without automatically opening an old conversation

## Startup flow

When the user enters `/chat`, the view should follow this order:

1. Read `GET /api/business/workspace` as the primary shell source.
2. Use `accessPolicy.canUseAssistant` to decide whether `/chat` is available.
3. If assistant access is allowed, load the conversation sidebar list.
4. Render the main panel empty, with the initial assistant greeting.
5. Let the user start writing immediately.
6. If the user sends a message before creating a conversation, create one first and then send the message.

## Important authentication point

The backend must not assume that the browser cookie alone authenticates the request.

The real rule is:

```http
Authorization: Bearer <access_token>
```

The frontend Next app uses local `/api/...` routes as an intermediate layer.
Those routes read the session cookie and forward the `access_token` to the backend in the `Authorization` header.

## Endpoints touched by the chat view

Base local route used by the UI:

```text
/api/assistant/conversations
```

### 1. Workspace access

```http
GET /api/business/workspace
```

What it is for:

- resolve the shell and onboarding state
- decide whether the user can enter chat at all
- provide `accessPolicy.canUseAssistant`

If assistant access is blocked:

- the UI does not call the assistant module
- the chat screen should not open

### 2. Conversation list

```http
GET /api/assistant/conversations?page=0&size=20
```

What it sends:

- query params:
  - `page`
  - `size`
  - `search` optional if the user types in the sidebar
- no body

What it is for:

- load the list of previous conversations

### 3. Conversation details

```http
GET /api/assistant/conversations/{id}
```

What it sends:

- `id` in the URL
- no body

What it is for:

- load the full conversation with all messages

### 4. Create a new conversation

```http
POST /api/assistant/conversations
```

What it sends:

```json
{
  "title": "New chat"
}
```

What it is for:

- create the initial conversation
- also used automatically when the user sends the first message with no selected conversation

### 5. Send a message

```http
POST /api/assistant/conversations/{id}/messages
```

What it sends:

```json
{
  "message": "Hello"
}
```

What it is for:

- save the user message
- receive the updated conversation with the assistant response

### 6. Archive a conversation

```http
PATCH /api/assistant/conversations/{id}/archive
```

What it sends:

- `id` in the URL
- no body

What it is for:

- remove a conversation from the active list

## Billing usage

Billing is not part of the chat bootstrap.

If the chat UI wants to show plan-related details, it may read billing as a secondary enrichment source, but it must not use billing to decide chat access.

Rules:

- `GET /api/billing/subscriptions` is optional
- billing failures must not block the chat shell
- no billing mutation should be triggered from chat
- no chat access check should depend on `subscription.active`

## Expected headers

Every protected request must include:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

The browser cookie is not enough by itself.
The token must be explicitly forwarded from the Next layer to the backend.

## What happens in the frontend before calling the backend

The chat view should follow this sequence:

1. Check access with `GET /api/business/workspace`.
2. If `accessPolicy.canUseAssistant` is `false`, do not call the assistant module.
3. If access is allowed, load the sidebar list.
4. If the user selects a conversation, load its details.
5. If the user types and sends, create a conversation if needed and then send the message.

## Common reasons for `403 Forbidden`

### Missing `Authorization`

The request reaches the backend, but it does not carry:

```http
Authorization: Bearer ...
```

### Invalid or expired token

Even if the header exists, the backend can reject it if the token is expired or fails validation.

### No assistant access in workspace policy

The workspace policy can block the chat module if `canUseAssistant` is `false`.

## Expected data shape

### Workspace response

The workspace response is the primary gate for chat.

Relevant fields:

- `accessPolicy.canUseAssistant`
- `accountType`
- `onboardingStatus`

### Conversation summary

Used in the sidebar.

Expected fields:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messageCount`

### Full conversation

Used in the main panel.

Expected fields:

- `id`
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `lastMessageAt`
- `messages`

### Message

Each message includes:

- `id`
- `role`
- `content`
- `intent`
- `createdAt`

## Short summary for backend

- The UI starts from `GET /api/business/workspace`.
- `accessPolicy.canUseAssistant` decides whether chat is reachable.
- The sidebar uses the summary list.
- The main panel uses the conversation detail.
- The frontend must not automatically open the last conversation.
- Every protected request must forward `Authorization: Bearer <access_token>`.
- If there is no assistant access, the frontend does not call the assistant module.
