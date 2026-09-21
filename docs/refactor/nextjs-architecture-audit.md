# Next.js frontend/BFF architecture audit

> **Scope:** diagnostic review only. This audit does not implement refactors, behavior changes, migrations, or commits.
>
> **Verdict:** the application has a useful server-first foundation, but it is **not yet a consistent remote-first Next.js BFF**. The highest-priority work is security and boundary hardening: an access token crosses into a Client Component, protected profile data is placed in a persistent cache, and command authorization is uneven across Server Actions. After those issues, the codebase should consolidate composition and HTTP behavior before attempting a broad DDD simplification.

## 1. Scope, method, and baseline

The review covered:

- `app/` pages, layouts, Proxy, Route Handlers, and authentication callback/session boundaries;
- every bounded context under `contexts/`, including Domain, Application, Infrastructure, Interfaces, schemas, gateways, adapters, Server Actions, Server Components, and Client Components;
- shared HTTP, session, workspace, caching, error, i18n, and shell code;
- `next.config.ts`, `api.config.ts`, TypeScript/ESLint/Vitest/Playwright configuration, CI, environment-file handling, and tests;
- the `ddd-nextjs` guidance and its references for architecture, application boundaries, infrastructure, reads, mutations, route orchestration, validation, UI, and pitfalls.

### Snapshot observations

- Next.js `16.3.4`, React `19.2.8`, TypeScript `~6.0.3`, and `cacheComponents: true` are in use.
- `api.config.ts` is `server-only` and centralizes the backend base URL. IAM and workspace cookies are `HttpOnly`; production cookies are `Secure` and `SameSite=Lax`.
- `contexts/shared/infrastructure/http/api-client.ts` is a good start: it centralizes JSON requests, defaults to `cache: "no-store"`, and has an `ApiError`/Problem Details extraction path.
- Many gateways validate upstream responses with Zod, and CRM plus some scheduling operations already perform explicit workspace permission checks.
- The observed baseline was 107 test files / 510 passing tests and lint passing with one warning. CI is configured to run lint, Vitest coverage, and build, but not Playwright E2E.
- `vitest.config.ts` currently measures coverage primarily for `contexts/iam`, so a green coverage result is not a coverage signal for the architectural/security hotspots identified here.
- `.env*` is ignored and no tracked secrets were found. `NEXT_PUBLIC_FIREBASE_*` values are client configuration, not backend credentials.
- The audit initially found an unexplained untracked empty file named `schemas` (`?? schemas`). Final validation also showed unrelated tracked changes and an untracked language-switcher file not made by this audit. None were modified by this audit; the only file written here is this document, and `schemas` is not treated as an application finding.

Static import counts are useful indicators, not a substitute for a dependency graph: the snapshot contains approximately 27 `app/` files importing Infrastructure, 37 importing Application internals, 24 Application files importing Infrastructure or Next APIs, and three Domain files importing Application types.

## 2. Target architecture

The target implied by the DDD/Next.js guidance is:

```text
Browser
  -> Server Component / Server Action / justified Route Handler
  -> request authentication + tenant/workspace composition
  -> Application query or command port
  -> Infrastructure HTTP adapter/gateway
  -> authoritative backend service
```

The important constraints are:

1. **The backend remains authoritative** for remote entities, permissions, plans, prices, and state transitions. A frontend Domain model is justified only where the browser genuinely owns a local invariant or interaction model.
2. **Domain and Application code remain framework-independent.** `next/headers`, `next/cache`, cookie access, concrete gateways, and `server-only` composition belong at the Interfaces/composition or Infrastructure edge.
3. **Server Components perform reads**, Server Actions perform validated mutations, and Route Handlers exist only for a real browser/BFF boundary such as streaming, downloads, or a deliberately public HTTP contract.
4. **Every command resolves an operation-level request context**: authenticated principal, organization, establishment/resource, and permission. Proxy/layout visibility checks are not authorization.
5. **Protected data is not placed in a shared persistent cache.** Request memoization is different from persistent `"use cache"`; the latter needs an explicit public/private/user/tenant policy.
6. **Transport responses are untrusted at runtime.** Schemas, safe error mapping, correlation, timeouts, cancellation, and bounded retry policy belong at the server boundary.

## 3. Severity and confidence

- **Critical:** an immediate credential, authorization, or data-isolation risk.
- **High:** material security, availability, business-integrity, or architectural risk that should block a broad feature expansion.
- **Medium:** important consistency, maintainability, or operational risk.
- **Low:** localized hygiene or quality issue.
- **Confirmed:** directly evidenced in the repository.
- **Conditional:** the code smell is confirmed, but exploitability or impact depends on backend behavior, deployment, or an external contract that was not available in this audit.

## 4. Findings at a glance

| ID | Severity | Confidence | Area | Finding |
|---|---|---|---|---|
| SEC-01 | Critical | Confirmed | Credential confidentiality | The HttpOnly access token is passed as a Client Component prop and therefore into the browser payload. |
| SEC-02 | High | Confirmed policy risk | Caching | Profile data fetched with a bearer token uses persistent `"use cache"` for hours and a global tag. |
| AUTH-01 | High | Confirmed gap; backend impact conditional | Authorization | Server Actions do not apply a consistent operation-level authentication, tenant, resource, and permission check. |
| ARCH-01 | High | Confirmed | Dependency direction | Domain/Application and `app/` code are coupled to concrete Infrastructure and Next APIs; composition is distributed. |
| ERR-01 | High | Confirmed | Errors/observability | Raw upstream messages/details are returned to clients and logs lack correlation/redaction conventions. |
| REL-01 | High | Confirmed | Reliability | HTTP requests and streaming have no standard deadline/cancellation policy, and retry behavior is incomplete. |
| DATA-01 | High | Confirmed duplication; ownership conditional | Remote-first correctness | Billing plans, prices, features, and metadata are duplicated locally although a billing gateway exposes backend plans. |
| HTTP-01 | Medium | Confirmed | Transport | Central `ApiClient` is bypassed by several multipart, streaming, profile, and browser fetch paths. |
| HTTP-02 | Medium | Confirmed | BFF boundaries | Route Handlers repeat orchestration/error logic, directly construct gateways, and several internal endpoints have no in-repository caller. |
| VAL-01 | Medium | Confirmed | Runtime validation | Compile-time types are trusted at Server Action boundaries and several response types are only TypeScript casts. |
| CACHE-01 | Medium | Confirmed | Cache/revalidation | Request reads are repeated across Proxy/layout/page/shell, while catalog invalidation tags do not correspond to cached reads. |
| STATE-01 | Medium | Confirmed | Client state | Remote state is split between RSC data, Server Actions, direct browser fetches, custom events, polling, and `router.refresh()`. |
| UPLOAD-01 | Medium | Confirmed | Resource limits | Image inputs have client hints but no application-level server size/MIME policy; multipart paths also bypass common HTTP policy. |
| TEST-01 | Medium | Confirmed | Quality gates | Coverage excludes most contexts and CI does not execute the existing real-backend E2E suite. |
| AUTH-02 | Medium | Conditional | Session hardening | The session-setting Route Handler/action accepts client-supplied token pairs; Origin/CSRF and contract hardening should be explicitly verified. |
| UI-01 | Low | Confirmed | Client hygiene | `EntityProfileCard` creates object URLs without the cleanup discipline already present in `ImageUploadAvatar`. |

## 5. Detailed findings

### SEC-01 — Access token crosses the server/client boundary

**Evidence**

- `contexts/notifications/interfaces/components/push-notification-register-server.tsx:7-14` reads `iamSessionCookies.accessToken` and renders `<PushNotificationRegister accessToken={accessToken} />`.
- `contexts/notifications/interfaces/components/push-notification-register.tsx:1-17` is a Client Component whose prop type explicitly contains `accessToken?: string`.
- The client component only needs to know whether registration should run; the actual `registerDeviceTokenAction` reads the HttpOnly cookie server-side (`contexts/notifications/interfaces/actions/notification.actions.ts:19-23, 117-126`).
- The cookie is correctly marked HttpOnly in `contexts/iam/infrastructure/session/iam-session-cookie.ts`, but serializing it as an RSC/Client Component prop defeats the confidentiality boundary.

**Impact**

The bearer credential can be present in the browser's RSC/Flight data and component state rather than remaining server-only. It increases exposure to XSS, browser tooling, extensions, accidental telemetry, snapshots, and future prop forwarding. This is an unnecessary credential disclosure: the client does not need the token value.

**Recommendation**

Remove credential-valued props from Client Components. Let the server action own authentication and return only a success/failure result. If the client needs a state hint, pass a non-sensitive boolean or let the action be attempted without a token prop.

**Acceptance criteria**

- No access or refresh token appears in Client Component props, rendered HTML, RSC payloads, browser logs, or client bundles.
- Push registration still works for an authenticated session and fails safely for an unauthenticated session.
- A regression test renders the server wrapper with a sentinel token and asserts that the serialized client output does not contain it.

### SEC-02 — Protected profile data uses a persistent cache policy

**Evidence**

- `contexts/profiles/interfaces/queries/get-my-profile.query-handler.ts:9-14` declares `fetchMyProfileQuery(accessToken)`, uses `"use cache"`, sets `cacheLife("hours")`, and applies the global `cacheTag("profile")`.
- `getMyProfileServerQuery` at lines 18-25 reads the HttpOnly token and passes it into that cached function.
- Profile mutations call `updateTag("profile")` (`contexts/profiles/interfaces/actions/update-profile.action.ts:54`, and the preferences action), but the tag is not user- or tenant-scoped.
- `contexts/shared/interfaces/components/layout/app-shell-data.ts:15-35` uses React `cache()` for request-level shell deduplication. That is a different mechanism and is not, by itself, evidence of a shared persistent cache; the profile call nested inside it still reaches SEC-02.

**Impact**

Bearer-token-derived personal data is retained under a persistent cache policy without an explicit private/user isolation contract. The cache key may distinguish arguments, but the token is still being used as a cache input and the data is retained for hours; the global tag also makes invalidation semantics too broad. Cross-user exposure depends on Next cache configuration/runtime behavior, but the policy is unsafe regardless because it treats authenticated data like public data.

**Recommendation**

Default protected profile reads to `no-store`, or adopt an explicitly private per-user/per-tenant cache supported by the deployed Next version. Do not use a bearer token as an opaque public cache key. Scope tags to the authenticated subject/tenant when a private cache is justified, and invalidate the exact scope after updates.

**Acceptance criteria**

- Two users cannot observe each other's profile through any cache hit, including after logout/login in the same process.
- Profile changes are visible immediately under the chosen policy.
- A test or static rule prevents authenticated query handlers from using unscoped persistent `"use cache"`.
- Request-level shell memoization remains covered by a test and is documented as request-scoped, not persistent.

### AUTH-01 — Operation-level authorization is inconsistent

**Evidence**

- `contexts/scheduling/interfaces/actions/create-appointment.action.ts:41-52` explicitly checks `canRead` and `scheduling:manage`.
- In contrast, `update-appointment.action.ts:37-40`, `reschedule-appointment.action.ts:34-37`, `cancel-appointment.action.ts:32-35`, `complete-appointment.action.ts:13-15`, `delete-appointment.action.ts:12-14`, `start-appointment.action.ts:13-15`, and `mark-no-show-appointment.action.ts:13-15` resolve a workspace and invoke the command service without the equivalent permission check. Several also accept an unvalidated appointment ID.
- Catalog mutations call `requireCatalogAccessToken()` and `requireCatalogOrganizationId()` (`contexts/catalog/interfaces/actions/manage-catalog-service.actions.ts:38-43, 64-69, 85-90`), but do not consistently check the establishment's `catalog:manage` permission. The page performs that check for UI affordances (`app/(protected)/(app)/catalog/page.tsx:31-40`), which is not a mutation boundary.
- Analytics Server Actions accept `preset`, `customOrgId`, and `customEstId` (`contexts/analytics/interfaces/actions/get-analytics-dashboard.action.ts:10-58`) without runtime validation or a local membership/permission check. The gateway forwards the caller-selected organization as `X-Organization-Id`.
- CRM actions are a positive counterexample: register/update/delete resolve the establishment and check `crm:manage` before invoking the command (`contexts/crm/interfaces/actions/*.action.ts`).

**Impact**

The Proxy and protected layouts establish navigation state, and UI permission flags hide controls, but an exported Server Action can be invoked directly by a client. If the backend enforces every permission and tenant relation, the backend remains the final security boundary; however, the frontend/BFF contract is inconsistent, expensive to audit, and vulnerable to accidental future backend assumptions. Caller-supplied IDs also create confused-deputy risk if a downstream endpoint trusts the forwarded tenant header.

**Recommendation**

Create one request-context guard that resolves the session, selected organization/establishment, resource ownership, and required operation permission. Use it in every command action and Route Handler. Derive tenant context from the authenticated workspace rather than trusting hidden fields, URL parameters, or UI visibility. Keep backend authorization authoritative and add explicit tests for both layers.

**Acceptance criteria**

- An authorization matrix lists every command/read operation, required scope, tenant source, and backend endpoint.
- Every mutation rejects unauthenticated, wrong-tenant, wrong-establishment, and insufficient-permission calls before the gateway is invoked.
- Scheduling and catalog actions have parity with CRM actions.
- Backend 401/403 responses are mapped to stable safe errors rather than leaked upstream messages.

### ARCH-01 — Dependency direction and composition are distributed

**Evidence**

- Domain services import Application view models: `contexts/catalog/domain/services/catalog-service.services.ts:1-9` and `service-category.services.ts:1-8` import DTOs/page types from Application. `contexts/profiles/domain/repositories/profile.repository.ts:1-3` returns `ProfileViewModel` from Application.
- Application code imports concrete Infrastructure: `contexts/business/application/internal/commandservices/establishment-command.service.ts:17-18`, `contexts/assistant/application/internal/commandservices/create-conversation-command.service.ts:4`, and many catalog/CRM/scheduling/notification services do the same.
- `contexts/shared/application/internal/queryservices/app-shell-query.service.ts:3,10,18` imports `next/headers`, IAM Infrastructure, and the shared HTTP error type. `contexts/billing/application/internal/queryservices/list-plans-query.service.ts:3` imports `next/cache`.
- Many Application modules are marked `server-only`, which makes framework/runtime policy part of the Application layer rather than the server composition edge.
- Page components wire internals directly, for example `app/(protected)/(app)/analytics/page.tsx:8-12`, `app/(protected)/(app)/chat/page.tsx:2-4`, and `app/(protected)/invoice/page.tsx:5-7`.

**Impact**

The code is difficult to replace, test in isolation, or reuse with a different transport. Transport schemas and backend DTOs leak into Domain/UI contracts, while factories and authentication resolution are spread through use cases, pages, gateways, and actions. This is architecture drift rather than a reason to force every remote CRUD feature into a rich frontend model.

**Recommendation**

Move consumer-owned ports and application DTOs to the Application boundary; keep Domain types independent of Application/Infrastructure. Move concrete gateway construction to a server composition module, for example a per-context `interfaces/composition/server` boundary. Pages and Route Handlers should call composed queries/commands, not instantiate adapters or gateways. Keep `server-only` on adapters, session access, and composition; remove it from pure Domain/Application code where possible.

Use a dependency rule in CI (dependency-cruiser, an ESLint rule, or a small import-graph check) to prevent Domain -> Application/Infrastructure and Application -> Next/concrete Infrastructure imports.

**Acceptance criteria**

- Domain has no imports from `application`, `infrastructure`, `next/*`, or `server-only`.
- Application has no concrete gateway construction or Next request/cache imports.
- Each feature has one documented composition entry point and one owner for token/tenant resolution.
- Application tests can inject fake ports without importing Next or HTTP implementations.

### ERR-01 — Error and observability contracts are unsafe and inconsistent

**Evidence**

- `contexts/business/interfaces/actions/business-action-result.ts:11-16` returns `error.message` directly; similar patterns occur across billing, catalog, CRM, scheduling, notifications, assistant, and profile actions.
- Assistant Route Handlers return raw messages (`app/api/assistant/conversations/route.ts:34-38`, `[id]/route.ts:32-34`, and `[id]/messages/route.ts:62-64`).
- Business/catalog Route Handlers may return both `error.message` and upstream `details` (`app/api/catalog/services/route.ts:75-106`, representative of the repeated route code).
- `contexts/shared/infrastructure/http/problem-details.ts` and `ApiError` provide a normalization point, but not every response/action uses it.
- `contexts/shared/interfaces/components/layout/app-shell-data.ts:39-47` logs whole errors, and many actions call `console.error` with the original error. No correlation/request ID convention was found in the application HTTP context.
- Route error helpers often turn any unclassified `Error` into HTTP 400 rather than distinguishing client, authentication, upstream, timeout, and internal failures.

**Impact**

Upstream implementation details, validation internals, or PII can be exposed to users and logs. Incorrect status codes make retries and client behavior unsafe, while the lack of a correlation ID makes a failed request hard to trace across Next and the backend.

**Recommendation**

Define one safe error taxonomy and Problem Details response contract: stable public code, localized/user-safe message, field errors where appropriate, correlation ID, and no raw `details` by default. Preserve full details only in redacted structured server logs. Map `ApiError` statuses centrally and classify unknown failures as 500/502, not 400. Never log authorization headers or token-bearing request objects.

**Acceptance criteria**

- No client response contains raw upstream `details`, stack traces, or arbitrary backend messages unless explicitly allow-listed.
- Every server request has a correlation ID propagated to the backend and returned in a safe response header/body field.
- Logs are structured and redact token, cookie, authorization, and sensitive payload fields.
- 400/401/403/404/409/422/429/502/504 mapping is covered by Route Handler and action tests.

### REL-01 — No common timeout, cancellation, or bounded retry policy

**Evidence**

- `contexts/shared/infrastructure/http/api-client.ts:57-100` calls `fetch` without adding a standard deadline or correlation header. `ApiRequestOptions` inherits `signal`, but callers do not have a common timeout helper.
- Direct multipart fetches occur in `contexts/business/infrastructure/gateways/organization-api.gateway.ts:35`, `organization-image-upload.adapter.ts:23`, `establishment-photo.adapter.ts:29`, and `contexts/profiles/infrastructure/repositories/http-profile.repository.ts:63`.
- The assistant stream uses a separate `fetch` path (`contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts:153-185`) and does not accept/pass an abort signal. The browser hook starts another direct stream fetch at `contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts:185` without an `AbortController`.
- `app/page.tsx:20-47` and protected layouts catch route-resolution failures and render an unavailable/retry link. `EntryRouteQueryService` classifies failures (`contexts/shared/application/internal/queryservices/entry-route-query.service.ts:72-85`) but does not perform a bounded read retry. `ApiClient` has no retry policy.

**Impact**

A stalled backend can hold a Server Component, action, or streaming connection indefinitely. Navigating away can leave an assistant stream running. A retry link simply repeats the request, while adding an indiscriminate automatic retry would risk duplicate payments or other uncertain mutations.

**Recommendation**

Add a request budget and `AbortSignal` propagation to the common HTTP port and every direct fetch. Use bounded exponential backoff with jitter only for idempotent reads and clearly retryable 502/503/504/network failures. Do not automatically retry mutations; use idempotency keys where a business operation can be safely retried. Forward `request.signal` to the assistant backend and cancel the browser reader on unmount/navigation. Add bounded stream duration/size and heartbeat behavior appropriate to the SSE contract.

**Acceptance criteria**

- Every backend call has an explicit deadline appropriate to its operation class.
- Aborting a browser request aborts the Next-to-backend stream and releases the reader.
- Read retries are observable, bounded, and never applied to payment or uncertain command calls.
- Route-resolution failures distinguish transient unavailability from unauthenticated/forbidden states and have a controlled retry budget.

### DATA-01 — Billing plans are duplicated instead of remaining backend-owned

**Evidence**

- `contexts/billing/infrastructure/gateways/billing-api.gateway.ts:81-88` exposes `getPlans(currency?)` and validates a backend plan response.
- The active local path instead constructs Standard/Max plans and prices in `contexts/billing/application/internal/queryservices/list-plans-query.service.ts:23-86`, caches them for days at lines 98-105, and is used by the billing plans Route Handler.
- `contexts/billing/domain/services/plan-pricing-policy.ts:6-22` contains a fixed PEN/USD/EUR pricing matrix.
- `contexts/billing/interfaces/components/subscribe/subscribe-view.tsx:54-88` adds another `PLAN_METADATA` table with descriptions/features that differ from the local Application plan metadata.
- `SubscribeView` also receives unvalidated `unknown` from payment success (`lines 121-136`) and renders local display prices; the backend/payment provider must remain authoritative for the charge.

**Impact**

A plan ID can acquire multiple names, prices, feature lists, and “popular” flags. A backend pricing or entitlement change can leave the UI stale or misleading, and a long-lived local cache can make the discrepancy persist. This is a business-integrity risk even if the backend correctly determines the actual charge.

**Recommendation**

Confirm the ownership contract. If Billing owns plans, remove local plan/pricing authority and use one validated backend read model; keep only presentation-only localization keyed by a stable backend plan ID. Never derive payment amounts or entitlements from client/local values. If a static catalogue is intentionally frontend-owned, remove or quarantine the unused gateway and document the contract/versioning policy.

**Acceptance criteria**

- One source defines plan ID, price, currency, billing-cycle rules, entitlements, and active state.
- UI metadata is keyed to a backend version/ID and cannot override price or entitlement data.
- Plan response and payment initiation have contract tests for currency/cycle/price consistency.
- Cache invalidation is tied to the actual owner and does not retain stale pricing beyond the agreed policy.

### HTTP-01 — Several transport paths bypass the common HTTP policy

**Evidence**

The common `ApiClient` exists at `contexts/shared/infrastructure/http/api-client.ts:45-133`, but direct fetches remain in:

- organization and establishment multipart adapters/gateways;
- profile image upload;
- assistant SSE gateway;
- invoice pagination/detail browser components (`contexts/billing/interfaces/components/invoice/invoice-view.tsx:49` and `invoice-detail-modal.tsx:38`);
- assistant browser streaming (`contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts:185`).

The common request context currently carries only token and tenant (`contexts/shared/infrastructure/http/request-context.ts:1-25`), so direct paths also bypass common tenant/header, timeout, correlation, error, and response-policy behavior.

**Impact**

Behavior varies by feature: some calls use `no-store`, runtime schemas, typed `ApiError`, and shared headers; others use hand-built multipart/SSE/browser logic or compile-time casts. Fixes to authentication, tracing, retry, and redaction can silently miss a path.

**Recommendation**

Keep one server transport port with JSON and multipart variants, a separate streaming primitive, and explicit request context (`token`/session reference, tenant, correlation ID, signal, deadline). It should be the only Infrastructure path used by gateways. Browser components should call a justified BFF action/Route Handler, never the backend directly.

**Acceptance criteria**

- A static check identifies every backend fetch and either permits it in the transport implementation or requires an explicit exception.
- JSON, multipart, and SSE paths share authentication, correlation, timeout, error, and redaction behavior.
- Client Components contain no backend URL or bearer-token logic.

### HTTP-02 — Route Handlers are both duplicated and too thick

**Evidence**

- The assistant message Route Handler directly constructs `AssistantApiGateway` for streaming (`app/api/assistant/conversations/[id]/messages/route.ts:4-5,31-48`) while other methods construct Application services directly.
- Repeated Route Handlers duplicate cookie extraction, validation, status mapping, and raw error serialization (`app/api/assistant/conversations/[id]/route.ts:17-94`).
- Assistant path parameter parsing occurs outside the `try` block (`[id]/route.ts:21,43,73` and the messages route at line 20), so malformed input can escape the intended 400 response path.
- Static repository search found no in-repository callers for much of `app/api/catalog/*`, `app/api/business/*`, or `app/api/iam/auth/session`; they may be intended external/public contracts, but that ownership is not documented. Invoice pagination and assistant streaming do have browser callers and are genuine BFF candidates.

**Impact**

The same feature has several orchestration styles and potentially several public surfaces. Unused-but-reachable routes expand the attack and maintenance surface. Thick handlers make security and error behavior diverge.

**Recommendation**

Keep Route Handlers only where the browser needs a real HTTP response (SSE, download, or deliberate BFF pagination). Put composition in one server module and make handlers thin: parse, resolve request context, call an Application port, map the result. Either remove undocumented duplicate routes or document their external consumer, authentication, versioning, rate limits, and contract tests.

**Acceptance criteria**

- Every retained Route Handler has an owner, consumer, auth contract, and test.
- Malformed path/query/body input consistently produces a 400 Problem Details response.
- No handler instantiates a concrete gateway or duplicates token/error plumbing.
- A repository search or route inventory confirms that internal browser calls do not accidentally use a redundant HTTP hop.

### VAL-01 — Runtime validation is incomplete at server and transport boundaries

**Evidence**

- `contexts/analytics/interfaces/actions/get-analytics-dashboard.action.ts:10-58` types `preset` as `AnalyticsPreset`, but a Server Action boundary receives runtime values. `AnalyticsDateRange.fromPreset` (`contexts/analytics/domain/model/value-objects/analytics-date-range.ts:17-42`) sends an unrecognized value through its default branch rather than rejecting it.
- Analytics organization/establishment IDs are accepted from action arguments, cookies, and forwarded headers without a shared runtime request schema.
- `BillingApiGateway.getInvoices` and `getInvoiceById` (`contexts/billing/infrastructure/gateways/billing-api.gateway.ts:114-133`) return TypeScript `PageResponse<InvoiceResponse>`/`InvoiceResponse` without parsing the response. CRM and notification gateways also have compile-time response paths without equivalent schemas, and catalog search maps an unvalidated page before validating only some individual operations.
- Invoice Client Components cast `response.json()` to `InvoiceResponse` (`invoice-view.tsx:52-55`, `invoice-detail-modal.tsx:45-46`).
- Several scheduling command actions validate form fields but not the appointment ID argument.

**Impact**

Malformed client input can produce surprising domain defaults, and backend contract drift becomes a runtime UI failure rather than a controlled boundary error. Invalid data can be cached, logged, or used to select a tenant before detection.

**Recommendation**

Validate every Server Action argument and every Route Handler parameter/body/query with schemas. Validate every backend response at the Infrastructure edge, including page envelopes and streaming event shapes. Use separate transport schemas and application read models rather than exporting gateway interfaces into Client Components.

**Acceptance criteria**

- Invalid runtime presets/IDs/tenant selections are rejected with stable validation errors.
- Every external response used by the UI has a schema or an explicitly documented opaque-stream contract.
- Client components consume Interface view models, not gateway/transport types.
- Contract tests cover missing fields, extra/invalid enum values, malformed dates, pagination, and upstream error bodies.

### CACHE-01 — Reads are repeated and invalidation does not match caching

**Evidence**

- Proxy, `app/page.tsx`, and protected layouts independently call entry-route resolution; the app layout calls it at `app/(protected)/(app)/layout.tsx:43-66`, while individual pages then fetch workspace data again.
- `contexts/shared/interfaces/components/layout/app-shell-data.ts:15-35` memoizes the shell within a request, but that memoization does not deduplicate separate Proxy/layout/page requests. `app/(protected)/(app)/analytics/page.tsx:45-59` is a representative page-level workspace/plan/data sequence.
- Catalog mutations call `updateTag` (`contexts/catalog/interfaces/actions/*.actions.ts`), but catalog reads use `ApiClient`, whose default is `cache: "no-store"` (`contexts/shared/infrastructure/http/api-client.ts:80-83`). No matching tagged cached read was found, so the tags do not currently provide the intended read invalidation.
- The local billing catalogue is intentionally cached for days; that policy is part of DATA-01 and should not be copied to protected/remote data without ownership proof.

**Impact**

A single navigation can make several backend calls, increasing latency and the chance that Proxy, layout, shell, and page observe different workspace state. Invalidations create false confidence when the read path is uncached.

**Recommendation**

Define a request-scoped authenticated context and memoized queries keyed by explicit workspace selection. Avoid making the same entry decision in Proxy, layout, shell, and page unless each layer has a distinct failure/redirect responsibility. For each cache tag, document the corresponding cached read; remove tags for `no-store` reads or deliberately introduce a scoped cache with a tested policy.

**Acceptance criteria**

- A representative navigation has a measured backend-call budget for entry/workspace/profile data.
- Request memoization is keyed by the actual authenticated workspace context and cannot cross requests/users.
- Every `revalidateTag`/`updateTag` has a matching cached read and a documented scope.
- Protected reads remain uncached or explicitly private.

### STATE-01 — Client/server remote state is fragmented

**Evidence**

- Invoice data is rendered on the server, then `InvoiceView` starts a second client fetch on mount using `setTimeout(..., 0)` (`contexts/billing/interfaces/components/invoice/invoice-view.tsx:45-69`). Errors are only logged and the JSON shape is not validated.
- Assistant state is split among Server Actions, a browser SSE fetch, local optimistic messages, custom window events, title polling, and `router.refresh()` (`contexts/assistant/interfaces/components/chat-view/hooks/use-assistant-stream.ts:35-305` and `use-conversation-title-polling.ts`).
- Several Client Components import Application/gateway response types instead of feature-owned Interface view models, even when the import is type-only.

**Impact**

The application has multiple sources of truth and multiple invalidation conventions. Race, stale-data, cancellation, and error behavior must be fixed separately for each feature. The invoice mount fetch is a workaround for cache behavior rather than an explicit data policy.

**Recommendation**

Use Server Components and Server Actions as the default remote-data path. Keep client state for draft/modal/pending/optimistic interaction state. For long-lived browser remote state, choose one explicit strategy per feature (RSC revalidation or one client cache library), with a single invalidation contract. Keep view models at the Interface boundary and add abort/version guards to long-running effects.

**Acceptance criteria**

- Each remote feature documents its source of truth and invalidation event.
- Invoice initial data is not unconditionally refetched, or the refetch has an explicit `no-store`/freshness reason, schema, abort, and user-visible error state.
- Assistant stream, optimistic state, title polling, and navigation have tested cancellation/race behavior.

### UPLOAD-01 — File inputs lack server-side resource policy

**Evidence**

- Client inputs use `accept="image/*"` (`contexts/shared/interfaces/components/upload/image-upload-avatar.tsx:74-83`), which is only a browser hint.
- Server Actions accept any non-empty `File` (`contexts/business/interfaces/actions/*.actions.ts` and `contexts/profiles/interfaces/actions/update-profile.action.ts:14-16`) without an application-level byte limit, MIME allow-list, image validation, or dimension policy.
- Multipart adapters call `fetch` directly (`contexts/business/infrastructure/adapters/organization-image-upload.adapter.ts:20-35`, `establishment-photo.adapter.ts:26-45`, and the profile repository) and therefore do not share the common deadline/error policy.

**Impact**

Oversized, malformed, or non-image uploads can consume request memory, hit implicit platform limits, or produce inconsistent backend failures. A client `accept` attribute is not a security boundary.

**Recommendation**

Set explicit per-operation size/MIME/dimension limits at the Server Action/BFF boundary and repeat validation in the backend. For larger media, use a deliberate upload protocol (for example, a signed upload) rather than relying on Server Action body behavior. Return safe validation errors and apply timeouts to multipart requests.

**Acceptance criteria**

- Oversized, wrong-MIME, malformed, and dimensionally invalid files fail before backend upload.
- Limits are documented and tested for profile, organization, and establishment uploads.
- Multipart requests have correlation, timeout, cancellation, and safe error mapping.

### TEST-01 — Coverage and CI do not protect the refactor hotspots

**Evidence**

- `vitest.config.ts:19-24` includes coverage mainly for `contexts/iam/**/*.ts(x)`, excluding most actions, Route Handlers, Application services, gateways, cache code, and Client Components.
- `.github/workflows/build-and-test.yml:36-39` runs coverage and build but no `bun run test:e2e`.
- The existing E2E suite (`tests/e2e/auth/login.spec.ts`) depends on a real backend, fixed users, and a fixed OTP (`tests/e2e/fixtures/test-users.ts`), so it is not currently a hermetic CI gate.
- Unit tests cover useful IAM, HTTP, gateway, profile, and policy paths, but there is no equivalent broad Route Handler/action authorization matrix for the scheduling/catalog gaps identified above.

**Impact**

The current green gate can miss the critical token, cache, permission, raw-error, streaming, and response-validation regressions. Adding a naive E2E job would make CI dependent on an unavailable or mutable external environment.

**Recommendation**

Expand coverage to all production contexts with meaningful thresholds by layer. Add unit tests for pure policies, Application port contract tests, adapter schema/error tests, Route Handler integration tests, and authorization tests for every mutation. Split E2E into a controlled environment with seeded data/test backend or a contract-compatible local service; run it in CI with explicit environment setup.

Add static architecture checks and a regression test that guarantees no credential prop crosses into a Client Component.

**Acceptance criteria**

- Coverage includes every changed context and reports thresholds by Domain/Application/Infrastructure/Interfaces rather than only IAM.
- CI runs deterministic security/authorization/route tests on every change.
- E2E has a documented backend fixture and does not silently depend on a developer's local service.
- A failed architecture/security gate blocks merge.

### AUTH-02 — Session establishment needs an explicit threat-model decision

**Evidence**

- `contexts/iam/interfaces/rest/routes/session.route.ts:15-33` exposes a POST that accepts any non-empty client-supplied `{ accessToken, refreshToken }` pair and sets HttpOnly cookies.
- `contexts/iam/interfaces/actions/create-session.action.ts:12-27` has the same setter behavior, and `AuthCallback` obtains tokens from the URL hash before calling it (`contexts/iam/interfaces/components/auth-callback.tsx:17-45`). The hash approach avoids sending those values in the normal HTTP request URL, which is a positive property.
- `app/api/iam/auth/session/route.ts` appears to export the Route Handler, but no in-repository caller was found; `createSessionAction` is the active callback path.

**Impact**

This is not asserted as an exploitable issue without the deployment's CSRF/Origin and OAuth threat model. It is a high-value session boundary that should not be left as an undocumented token setter, especially if the Route Handler is externally reachable.

**Recommendation**

Prefer the server-side code exchange path where possible. For any token setter that remains, validate input shape/length, enforce same-origin/Origin policy and the framework's Server Action protections, clear old workspace context, avoid logging values, and document why a browser-supplied session pair is required. Remove or protect the unused duplicate Route Handler.

**Acceptance criteria**

- A threat-model test covers cross-origin POST, replay, invalid pair, logout/login account switching, and stale workspace cookie clearing.
- The public/session route has a documented consumer and CSRF/Origin policy.
- Tokens never appear in logs, query strings, error bodies, or analytics.

### UI-01 — Object URL cleanup is inconsistent

`contexts/shared/interfaces/components/upload/image-upload-avatar.tsx` revokes object URLs on replacement/unmount, but `contexts/business/interfaces/components/entity-profile-card/entity-profile-card.tsx` creates a preview URL in `handleFileChange` without equivalent cleanup. This is a low-severity browser memory leak on repeated image selection. Reuse the same upload-preview abstraction or add lifecycle cleanup; include it in the component test suite.

## 6. Bounded-context assessment

| Context | Current shape | Assessment and target direction |
|---|---|---|
| IAM | Session cookies, refresh coordination, Proxy session resolution, Server Actions, and a callback client | Strongest server boundary in the repository. Centralize request auth context and harden session establishment; keep tokens server-only. |
| Business | Rich organization/establishment entities, repositories, multipart adapters, workspace view model | Some local value objects/invariants are defensible. Move wiring out of Application, validate uploads, and require operation-level organization/establishment permissions. |
| Catalog | Local service/category entities, DTOs, Server Actions, duplicate Route Handlers, tag invalidation | Mostly remote CRUD. Keep only demonstrably local form/domain invariants; use one composed server path and explicit `catalog:manage` checks. |
| CRM | Remote gateway and customer commands with explicit `crm:manage` checks in actions | Good authorization pattern to replicate. Add response schemas, safe errors, and port/composition separation. |
| Scheduling | Local appointment model and many command actions; permission checks only on some commands | Backend owns appointment transitions. Close the action-level permission/ID-validation gaps before simplifying models. |
| Billing | Backend gateway plus local plan/pricing catalogue, Server Actions, invoice BFF routes and browser pagination | Highest business-authority duplication. Make backend Billing the single plan/price source and preserve a justified BFF only for invoice browser interactions. |
| Assistant | Remote conversation adapter/repository, Server Actions, browser state, genuine SSE Route Handler | A Route Handler is justified for SSE, but it needs thin composition, abort propagation, event/error contracts, and consistent tenant/auth context. |
| Analytics | Remote dashboard gateway with runtime response schemas, page and Server Actions | Keep as remote read models. Add runtime action-input validation and derive tenant/establishment context from authorization rather than caller-selected IDs. |
| Profiles | Remote repository plus local preferences/value objects and a cached profile query | Keep local validation only where it improves UX; remove unsafe persistent cache and do not expose session credentials. |
| Notifications | Server Actions and global gateway; push registration wrapper currently leaks access token | Keep registration server-side; validate device-token inputs and use safe error/logging policies. |
| Shared | HTTP client, Problem Details helper, shell/entry routing, i18n, workspace policies | Good location for cross-cutting contracts, but it currently mixes Application orchestration, Next request APIs, and Infrastructure. Split pure policies from server composition. |

## 7. Phased refactor plan

### Phase 0 — Security and contract containment

1. Remove the access-token Client Component prop and add a regression test for serialized output.
2. Disable or privatize the profile persistent cache; test cache isolation and update visibility.
3. Build the operation authorization matrix. Add guards to every scheduling/catalog/business/analytics mutation and validate resource IDs before gateway calls.
4. Replace raw action/Route Handler errors with safe codes/messages and redact structured logs.
5. Decide the session-establishment threat model and remove/protect the duplicate session Route Handler.
6. Do not add broad automatic retries while mutations lack idempotency semantics.

**Exit gate:** no credential crosses the server/client boundary; protected-data cache behavior is documented and tested; every mutation has a tested auth/tenant/resource/permission decision; no raw upstream details are client-visible.

### Phase 1 — Establish composition and transport ownership

1. Introduce a per-context server composition boundary that resolves cookies/session, workspace, ports, gateways, and adapters.
2. Move concrete construction out of Application classes and pages. Keep Application use cases dependent on consumer-owned ports.
3. Refine `ApiClient` into the common JSON/multipart transport and a separately controlled streaming transport. Add correlation ID, timeout/deadline, `AbortSignal`, tenant context, safe error normalization, and response-schema hooks.
4. Make genuine Route Handlers thin. Keep assistant SSE and any invoice/download boundary only where browser behavior requires them; remove or document the rest.
5. Add dependency-graph checks so Domain/Application cannot import Next or Infrastructure.

**Exit gate:** every backend request is visible through an approved transport/composition path; retained routes have an owner and contract; `bun run lint`, typecheck/build, and architecture checks pass.

### Phase 2 — Restore remote-first ownership and cache discipline

1. Confirm ownership of Billing plans. Prefer `BillingApiGateway.getPlans` and a validated backend read model if Billing is authoritative; remove local fixed price authority and duplicated metadata.
2. Classify each local Domain model as either a real frontend invariant or a remote DTO wrapper. Simplify remote CRUD contexts instead of preserving entities by habit.
3. Define cache policy by data class: public/static, request-scoped, private per-user, private per-tenant, and uncached protected data. Every tag must point to a matching cached read.
4. Introduce request-scoped workspace/entry orchestration to reduce Proxy/layout/page duplicate calls without putting session data in a shared cache.

**Exit gate:** backend-owned plans/prices/entitlements have one source; protected cache isolation is proven; navigation has a measured backend-call budget.

### Phase 3 — Client state, streaming, uploads, and UI contracts

1. Keep Server Components as the default remote read path and Server Actions as the default mutation path.
2. Choose one explicit remote-state strategy for features that require client interaction; remove unconditional invoice refetch workarounds and document assistant event/polling ownership.
3. Add stream cancellation, bounded duration/size, event validation, and safe reconnect behavior. Never retry an uncertain message/payment mutation automatically.
4. Add server-side upload size/MIME/dimension limits and choose a signed-upload flow for media that should exceed the request budget.
5. Expose Interface view models to Client Components instead of gateway/Application transport types; clean up object URLs.

**Exit gate:** no unbounded browser/backend stream remains; invalid files and malformed responses fail predictably; client state has a documented source of truth.

### Phase 4 — Tests, observability, and CI enforcement

1. Expand Vitest coverage scope and thresholds beyond IAM.
2. Add authorization matrix tests for every command, Route Handler tests for safe status/error contracts, cache-isolation tests, and transport schema/timeout/cancellation tests.
3. Add a deterministic E2E environment with seeded users/backend or an approved contract-compatible test service; run it in CI.
4. Add structured logs/metrics/traces keyed by correlation ID and backend status, with redaction tests.
5. Add dependency and credential-boundary static checks to CI.

**Exit gate:** security, architecture, contract, unit, and deterministic E2E gates all run in CI; no green gate depends only on IAM coverage.

## 8. Recommended acceptance checklist

Before considering the refactor complete:

- [ ] No bearer/access/refresh token is passed to a Client Component or included in client-visible serialized data.
- [ ] Protected data is `no-store` or explicitly private and scoped; no shared tag/cache can cross user or tenant boundaries.
- [ ] Every Server Action and Route Handler validates runtime input and resolves authentication, tenant, resource, and permission context.
- [ ] Backend remains authoritative for remote plans, prices, permissions, and state transitions.
- [ ] Domain/Application imports obey inward dependency rules and do not require Next runtime APIs.
- [ ] Pages use composed Application queries/commands; they do not instantiate gateways/adapters.
- [ ] Route Handlers are limited to documented browser/BFF boundaries and return one safe Problem Details contract.
- [ ] All backend calls have correlation, deadline, cancellation, safe response parsing, and a deliberate retry policy.
- [ ] Client remote state has one source of truth per feature; streams and effects are cancellable.
- [ ] Uploads have server-side resource/type validation.
- [ ] Coverage, authorization tests, route tests, cache tests, and deterministic E2E run in CI.
- [ ] `schemas` is either explained/removed by its owner in a separate change or intentionally preserved; this audit does not modify it.

## 9. Residual questions to resolve before implementation

These items were intentionally not promoted to confirmed vulnerabilities because the backend/deployment contract was outside this repository:

- Does every backend command independently enforce authenticated tenant/resource ownership and the permission represented by the forwarded organization/establishment headers?
- Which Next cache handler/runtime is used in production, and does it guarantee the required private-cache semantics for the profile query? The current policy is unsafe even without proving a cross-user hit.
- Are the apparently unused Business, Catalog, IAM session, and billing Route Handlers consumed by another application or external client? If so, their public contracts must be documented before removal.
- Is Billing or the frontend the owner of plan catalogue metadata/pricing, and which service is authoritative for payment amounts and entitlements?
- What are the backend's upload limits and SSE framing/heartbeat/cancellation semantics?
- Is there a supported seeded backend or contract-compatible test service for deterministic CI E2E?

## 10. Reference basis

This assessment was compared against:

- `skills/software-engineering/domain-driven-design-ddd/frameworks/next-ddd/SKILL.md`;
- `references/architecture-and-structure.md`;
- `references/application-layer.md`;
- `references/infrastructure-layer.md`;
- `references/reads.md`;
- `references/mutations-and-forms.md`;
- `references/route-orchestration.md`;
- `references/validation-strategy.md`;
- `references/domain-model.md`;
- `references/ui-layer.md`; and
- `references/checklist-and-pitfalls.md`.

The recommendations deliberately preserve the guidance's remote-first rule: do not introduce frontend domain models merely to mirror backend entities, and do not use a frontend cache, permission flag, or UI route guard as a substitute for backend ownership and authorization.
