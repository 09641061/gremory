# STATUS

## Executive summary
Implemented the shared transport/domain contracts that were blocking cleanup work: canonical `ActionState`, `PageResponse<T>`, `ProblemDetails`, and `ApiRequestContext`/`AuthenticatedRequestContext`, then updated the current Assistant/Billing/CRM/Scheduling consumers to use them. I also fixed a billing invoice pagination type-check issue exposed by the stricter shared page contract.

Partial work remains on the broader cleanup plan: session boundary consolidation, auth matrix normalization across all actions/route handlers, profile cache migration, entry-route/platform extraction, and the large UI/context splits.

## P0.1–P4 checklist

### P0.1 — baseline + import graph
- **Status:** partial
- **Files touched:** `STATUS.md`
- **Tests added:** none
- **Commands run:** `bun run test` (passed), `bun run lint` (passed), `bun run build` (passed after contract fixes)

### P0.2 — contracts
- **Status:** done
- **Files touched:**
  - `contexts/shared/application/model/action-state.ts`
  - `contexts/shared/application/model/page-response.ts`
  - `contexts/shared/infrastructure/http/problem-details.ts`
  - `contexts/shared/infrastructure/http/request-context.ts`
  - `contexts/shared/infrastructure/http/api-client.ts`
  - `contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts`
  - `contexts/billing/infrastructure/gateways/billing-api.gateway.ts`
  - `contexts/catalog/domain/services/catalog-service.services.ts`
  - `contexts/catalog/domain/services/service-category.services.ts`
  - `contexts/crm/application/services/crm-query.service.ts`
  - `contexts/crm/interfaces/actions/action-state.ts`
  - `contexts/crm/interfaces/actions/delete-customer.action.ts`
  - `contexts/crm/interfaces/actions/register-customer.action.ts`
  - `contexts/crm/interfaces/actions/resolve-document.action.ts`
  - `contexts/crm/interfaces/actions/update-customer.action.ts`
  - `contexts/scheduling/application/model/page-response.ts`
  - `contexts/scheduling/interfaces/actions/action-state.ts`
  - `contexts/scheduling/interfaces/actions/cancel-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/complete-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/create-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/delete-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/mark-no-show-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/reschedule-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/start-appointment.action.ts`
  - `contexts/scheduling/interfaces/actions/update-appointment.action.ts`
  - `contexts/billing/interfaces/components/invoice/invoice-view.tsx`
- **Tests added:**
  - `tests/unit/contexts/shared/application/action-state.test.ts`
  - `tests/unit/contexts/shared/infrastructure/http/request-context.test.ts`
- **Commands run:** `bun run test` (passed), `bun run build` (passed)

### P0.3 — auth matrix
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

### P0.4 — cache audit
- **Status:** partial
- **Files touched:** none in cache-bearing feature code
- **Tests added:** none
- **Commands run:** `bun run test` (passed), `bun run build` (passed)

### P0.5 — widen Vitest coverage
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

### P1.1–P1.5
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

### P2.1–P2.5
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

### P3.1–P3.5
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

### P4.1–P4.5
- **Status:** deferred
- **Files touched:** none
- **Tests added:** none
- **Commands run:** not run

## Functional changes
- Centralized action-state shape so CRM and Scheduling Server Actions share the same canonical contract.
- Centralized page-response typing so Assistant/Billing/CRM/Catalog/Scheduling read models use one shared contract.
- Added canonical API request context support for `token` + `tenantId`, and used it in the Assistant gateway.
- Billing invoice pagination now tolerates missing `totalPages` from the current shared page contract by falling back to `page.totalPages`.
- CRM action results now consistently include `errorId` and `fieldErrors` in error/success payloads.

## Known follow-ups
- Normalize auth/tenant/permission handling for every Server Action and `app/api` route.
- Decide and implement the single session boundary owned by IAM.
- Finish the profile cache decision: keep token-keyed public cache vs migrate to private/session-scoped caching.
- Move app shell/routing composition out of `shared` into a platform boundary.
- Normalize route handlers around a single Problem Details response helper.
- Continue the remaining P2–P4 feature splits called out in `docs/NEXTJS_CLEANUP_PLAN.md`.

## Import-graph report
### Notable cross-context edges introduced/retained in this change
- `contexts/assistant/infrastructure/gateways/assistant-api.gateway.ts` → shared `PageResponse`, `buildApiRequestHeaders`
- `contexts/billing/infrastructure/gateways/billing-api.gateway.ts` → shared `PageResponse`
- `contexts/catalog/domain/services/catalog-service.services.ts` / `service-category.services.ts` → shared `PageResponse`
- `contexts/crm/application/services/crm-query.service.ts` → shared `PageResponse`
- `contexts/crm/interfaces/actions/*` → shared `ActionState`, shared API error types, business workspace query service
- `contexts/scheduling/interfaces/actions/*` → shared `ActionState`, business workspace query service
- `contexts/shared/infrastructure/http/api-client.ts` → shared request-context/problem-details helpers

### Cross-context dependencies still present outside this change
- Shared shell/application services still depend on Business/Billing for routing and workspace state.
- CRM/Scheduling actions still depend on Business workspace authorization.
- Assistant gateway still depends on IAM session cookies for token fallback.

## Auth matrix
| Endpoint / action | Auth | Tenant | Permission |
|---|---|---|---|
| `contexts/crm/interfaces/actions/registerCustomerAction` | IAM session via workspace lookup | establishment-derived organization | `crm:manage` |
| `contexts/crm/interfaces/actions/updateCustomerAction` | IAM session via workspace lookup | establishment-derived organization | `crm:manage` |
| `contexts/crm/interfaces/actions/deleteCustomerAction` | IAM session via workspace lookup | establishment-derived organization | `crm:manage` |
| `contexts/crm/interfaces/actions/resolveDocumentAction` | IAM session via workspace lookup | establishment-derived organization | workspace readable |
| `contexts/scheduling/interfaces/actions/createAppointmentAction` | IAM session via workspace lookup | establishment-derived organization | `scheduling:manage` |
| `contexts/scheduling/interfaces/actions/*appointment*` | IAM session via workspace lookup | establishment-derived organization | scheduling capability for mutating actions |
| `app/api/billing/plans` | public | none | none |
| `app/api/billing/subscriptions` | authenticated IAM access token | tenantless | subscription ownership / backend checks |
| `app/api/billing/invoices` | authenticated IAM access token | tenantless | subscription ownership / backend checks |
| `app/api/assistant/conversations*` | authenticated IAM access token | organization header via gateway | backend authorization |
| `app/api/business/*` | authenticated IAM access token | organization/workspace path params | backend authorization |
| `app/api/catalog/*` | authenticated IAM access token | establishment/org scope | backend authorization |

## Cache inventory
| Data | Scope | TTL | Invalidation |
|---|---|---|---|
| My profile (`fetchMyProfileQuery`) | per-user (access-token keyed) | hours | `cacheTag("profile")` + `updateTag("profile")` / related `revalidatePath` calls on profile mutations |
| Billing plans (`listPlansByCurrencyQueryService`) | public | days | `cacheTag("billing-plans")` |
| Assistant conversation list/read models | per-user + tenant | schema-driven / request-scoped at gateway boundary | backend read model cache tags + route invalidation where applicable |
| CRM/Scheduling page data | request-scoped | none explicit | `revalidatePath` on mutations |

## Contracts
- **ActionState<T>**: canonical shared union in `contexts/shared/application/model/action-state.ts`; idle/success/error branches now share one shape and helper constructors exist for stable testable creation.
- **PageResponse<T>**: canonical shared page model in `contexts/shared/application/model/page-response.ts`; feature-specific aliases re-export it.
- **Problem Details**: canonical parser/model in `contexts/shared/infrastructure/http/problem-details.ts`; `api-client` uses it for error extraction.
- **ApiRequestContext**: `{ token?: string; tenantId?: string }`; `ApiClient` accepts it directly and injects headers.
- **AuthenticatedRequestContext**: `{ token: string; tenantId?: string }`; ready for server-side auth boundaries.
- **Session boundary**: still effectively split across IAM cookies/session helpers; the planned single IAM-owned server boundary is not yet implemented.

## Validation output
- `bun run lint` → passed.
- `bun run test` → passed, 99 files / 462 tests.
- `bun run test:coverage` → passed, 86.07% statements / 76.96% branches / 85.29% functions / 87.37% lines.
- `bun run build` → passed after fixing the shared page/action-state contracts and invoice pagination fallback.

## Residual risks
- The broader auth/session/cache cleanup is still incomplete.
- `ActionState` and `PageResponse` are canonical now, but many higher-level plan items remain deferred.
- Profile cache policy is still audited but not migrated.

## Commands run
- `bun run test` — passed
- `bun run lint` — passed
- `bun run test:coverage` — passed
- `bun run build` — passed
- `git diff --check` — passed

## Diff summary
Shared transport contracts were centralized, multiple feature consumers were pointed at those contracts, and one billing UI type issue was corrected. No large feature refactor was attempted.
