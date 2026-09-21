# DDD Refactor — Lane Board

## Status: Phase 1 (foundation) complete; Phase 2 in progress.

## Lane assignments

| Lane | Agent | Worktree path | Branch | BCs | Status |
|---|---|---|---|---|---|
| A | developer | `.worktrees/ddd-identity-foundation` | `feature/ddd-identity-foundation` | shared (Phases 2-6), iam, profiles, business | launching |
| B | developer | `.worktrees/ddd-operational-core` | `feature/ddd-operational-core` | catalog, crm, scheduling | launching |
| C | developer | `.worktrees/ddd-specialized-domains` | `feature/ddd-specialized-domains` | billing, notifications, analytics, assistant | launching |

## Why independent

- Distinct bounded contexts; no file overlap between BCs.
- Shared Phase 1 (header precedence + sanitizer + edge builder) already
  committed to `feature/add-refactor-domain-roles` (HEAD `22ae7fea`).
- Lane A also owns the shared/application composition cleanup (no BC files).

## Authority

Each lane is the sole writer for its worktree. They may edit shared files only
inside `contexts/shared/interfaces/` (composition helpers) and must document
the touch-points in their handoff.

## Gates per lane

- `bun run lint` clean
- `bunx tsc --noEmit` clean
- `bun run test` — baseline (863 tests) must keep passing; each lane should
  add regression tests for the new ports/composition it introduces.

## Handoff format

Each lane returns: changed file count, new files with brief purpose, test
results, any deferred work, and any blocker requiring parent decision.
