# DDD Refactor — Implementation Status

## Current state

The bounded-context refactor plans have been implemented and integrated in the
working tree on `feature/add-refactor-domain-roles`. Each bounded context is
kept as a **REMOTE FEATURE**: the frontend owns ports, transport adapters,
validation, composition, authorization boundaries, and view models; backend
business rules and undocumented endpoint behavior are not duplicated.

The implementation was completed through isolated developer lanes for:
Analytics, Assistant, Billing, Business, Catalog, CRM, IAM, Notifications,
Profiles, Scheduling, and Shared/architecture. Lane copies and obsolete
worktrees were removed after integration. No commit was created.

## Delivered by concern

### Shared foundation and architecture

- Server-authoritative `Authorization`, `X-Organization-Id`, and
  `X-Correlation-Id` propagation with case-insensitive spoof protection.
- Request-scoped correlation and timeout/cancellation propagation.
- Transport-only `ApiClient` and multipart support; runtime response parsing
  remains at Infrastructure boundaries.
- Bounded, non-throwing `recordSafely`/diagnostic sanitization with credential,
  token, PII, cycle, getter, and stack protection.
- Server-only composition seams and an import/layer architecture gate.
- Entry-route, app-shell, and public error states preserve unavailable versus
  unauthorized/not-found behavior.

### IAM and Profiles

- Composition-based authentication/session access and proxy token propagation.
- Validated authentication responses and protected cookie/session handling;
  no browser cookie writes or token logging.
- Profile ports, infrastructure contracts/mappers, transport-neutral image
  input, current-profile reuse in the sidebar, and safe post-write
  invalidation.

### Business

- Workspace, organization, and establishment ports with server-only
  composition.
- Target-aware organization/establishment authorization.
- Server-owned workspace-selection cookies and transport-neutral upload seams.
- Trusted token and tenant propagation through Business gateways.

### Catalog and CRM

- Application-owned Catalog ports/read models and CRM ports/projections.
- Zod contracts for provider pages and resources.
- Bounded target lookup instead of unbounded authorization page scans.
- Validated CRM mutation/document inputs, target authorization, safe action
  errors, and client view models.

### Scheduling

- Injected appointment and roster ports/services.
- Runtime contracts for appointment, roster, customer, and service responses.
- Centralized target authorization and application-owned employee mutations.
- Explicit revalidation and distinct forbidden/not-found/technical results;
  read failures are not converted into empty pages or `null`.

### Billing and Notifications

- Billing ports, composition, runtime contracts, invoice query/actions, and
  explicit billing-manager/tenant authorization.
- Invoice UI reads through the server boundary and correct `/invoice`
  invalidation.
- Notification runtime contracts, composed device registration, explicit
  action/state fields, sanitized Firebase diagnostics, and documented
  non-atomic invitation acceptance.
- `targetToken` remains compatibility-only until the backend confirms an
  ID-only acceptance contract.

### Analytics and Assistant

- Analytics application ports/read models, runtime contracts, server
  composition, capability-based Max authorization, and client-only export.
- Assistant application ports/composition, workspace authorization, runtime
  contracts, and validated bounded SSE forwarding.
- SSE only permits the documented stable event set, bounds frames/payloads,
  redacts malformed/upstream failures, and terminates with `done`.

## Validation gates

All gates pass after integration:

- `bunx tsc --noEmit`
- `bun run lint`
- `bun run test -- tests/architecture` — 3 tests passed
- `bun run test` — **136 test files, 892 tests passed**

## Known contract-dependent residuals

- Backend-specific SSE event semantics, Billing capability naming, upload
  limits, and invitation atomicity remain intentionally unresolved because the
  remote contracts are not available.
- Invitation acceptance is still a documented two-call workflow and can leave
  a notification accepted while the invitation remains pending if the second
  call fails.
- The frontend must continue treating backend 401/403/404/5xx responses as
  authoritative and must not infer permissions from plan display names or
  localized text.
