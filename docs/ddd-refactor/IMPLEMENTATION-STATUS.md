# DDD Refactor — Implementation Status

This document records the work delivered this session. The Token Plan rate
limit hit before the three developer subagents could run; remaining work
was done inline with the same goals.

## Delivered

### Phase 1 — Shared foundation (committed `22ae7fea`)

- `contexts/shared/infrastructure/http/request-context.ts` — restored
  authoritative header precedence (`Authorization`, `X-Organization-Id`,
  `X-Correlation-Id`) and made every casing variant of caller-supplied
  values be stripped.
- `contexts/shared/infrastructure/http/request-context-builder.ts` —
  edge helper that validates incoming correlation ids and never emits
  blank `token` / `tenantId`.
- `contexts/shared/interfaces/observability/sanitize-error.ts` — bounded
  diagnostic policy that redacts forbidden keys, handles circular
  causes, truncates long stacks, and never calls `console.*`.
- 15 new regression tests for spoofing, correlation reuse, sanitizer.

### Phase 2 — Application ports + composition (committed in 3 follow-ups)

| BC | Ports | Composition | Critical fixes |
|---|---|---|---|
| iam | `application/ports/{iam-session-reader,iam-authentication-writer,iam-session-coordinator}.ts` | `interfaces/server/iam-composition.ts` | cookie validated before write; proxy uses composition |
| profiles | `application/ports/{profile-reader,profile-writer}.ts` | `interfaces/server/profile-composition.ts` | `File` removed from Domain (transport-neutral `ProfileImageInput`); factory singleton removed; cache-invalidation failure swallowed |
| business | `application/ports/{business-workspace-reader,organization-reader-writer,establishment-reader-writer,organization-image-input,page-result}.ts` | `interfaces/server/business-composition.ts` | target-aware authorization rewritten using composition (no factory singleton) |
| catalog | (existing services) | `interfaces/server/catalog-composition.ts` | composition seam created |
| crm | (existing) | existing `crm-composition.ts` | kept as-is |
| scheduling | (existing) | `interfaces/server/scheduling-composition.ts` | composition seam created |
| billing | (existing) | `interfaces/server/billing-composition.ts` | composition seam created |
| notifications | (existing) | `interfaces/server/notification-composition.ts` | composition seam created |
| analytics | (existing) | `interfaces/server/analytics-composition.ts` | composition seam created |
| assistant | (existing) | `interfaces/server/assistant-composition.ts` | composition seam created |

### Gates

- `bun run lint` clean
- `bunx tsc --noEmit` clean
- `bun run test` → **863/863 passing**

## Not delivered / deferred

The Token Plan rate limit (`429 Token Plan rate limit reached`) was hit
during the parallel subagent dispatch. The remaining work in each plan
is substantial and was deferred to keep the codebase green. Items left
for follow-up commits:

### Per-BC deferred work (still pending)

- **iam**: move every action/route to use `composeIamAdapters`; replace
  remaining `console.error` calls with `recordSafely`; tighten
  refresh-coordination policy.
- **profiles**: full sidebar reuse of `currentProfile`; concrete
  backend-driven MIME/size caps once contracts are confirmed.
- **business**: migrate all gateways to implement the new ports;
  switch every upload path to `apiClient.requestMultipart`; centralise
  revalidation paths (real `/configuration/...` routes); remove raw
  `fetch` from upload adapters; move workspace-selection cookie writes
  off client components.
- **catalog**: move response schemas (including page envelopes) to
  `infrastructure/contracts/`; replace the paginated scan used by
  authorization with a target-aware lookup.
- **crm**: separate response contracts; add Zod input schemas for
  delete / resolve-document; replace raw `console.error` with
  `recordSafely`; update Client Components to consume view models.
- **scheduling**: remove `server-only` from Application; centralise
  authorization; route employee mutations through Application; define
  explicit revalidation; replace error-to-empty-array fallbacks with
  not-found / forbidden / technical distinction.
- **billing**: separate response contracts; add `canManageBilling` /
  target-tenant authorization in every action/route; fix `/invoice`
  invalidation; remove direct `/api` fetches from UI.
- **notifications**: extend runtime schemas to all responses; route
  device registration through Application; remove Firebase payload
  logging; document invitation atomicity.
- **analytics**: export logic move from Domain to `interfaces/client`;
  centralise `requireAnalyticsContext`; replace
  `planName.includes("max")` with capability-based authorization.
- **assistant**: define SSE contract (event names, payload shape, max
  size, terminal/error/cancel rules); centralise workspace-id check;
  migrate the SSE endpoint to composition.
- **shared (Phases 2-6)**: move cross-context composition out of
  `contexts/shared/application/internal/outboundservices/` into
  `contexts/shared/interfaces/server/`; convert application services
  into pure handlers; centralised error/sanitizer helpers wired
  across BCs.

### Architectural test (Phase 6 gate)

The plan calls for an architecture test that prohibits imports outward
from Domain/Application and platform types in Domain. This was not
delivered this session; the proposed location is
`tests/architecture/layer-imports.test.ts` using `ts-morph` or a
hand-rolled AST walker. Recommend doing it as part of the next
follow-up commit when more BCs have migrated their Application layer.

## How to continue

The worktrees were removed after the rate-limit failure; to resume
the parallel pattern once quota is available:

```sh
git worktree add .worktrees/ddd-<batch> -b feature/ddd-<batch> HEAD
# dispatch one developer subagent per worktree
```

The lane-board document at `.pi/subagents/ddd-refactor-lane-board.md`
still describes the intended partitioning if you want to resume the
parallel pattern.
