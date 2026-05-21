# Architecture Decision Records

Decisions are append-only. To change a decision, add a new record and mark the prior one as superseded — never edit history.

Format per ADR: **Context · Decision · Consequences · Status**.

---

## ADR-001 — Authentication: SIWB over SIWE
**Date**: 2026-05-22
**Status**: Accepted

**Context**
The roadmap commits to Base Account SDK. Two auth flows are viable: SIWE (Sign in with Ethereum, EIP-4361 standard) or SIWB (Sign in with Base, Base-native variant offered by `@base-org/account`).

**Decision**
Use **SIWB** as the primary auth flow. The `building-with-base-account` skill already documents the integration; SIWB offers smart-wallet-native UX (no nonce roundtrip surprises with EIP-1271 signatures) and aligns with Base's preferred onboarding.

**Consequences**
- Frontend depends on `@base-org/account`.
- Server-side verification uses the SDK's verifier rather than raw EIP-4361 parsing.
- Fallback to plain SIWE is not implemented in v1; if a user lacks a Base smart wallet, they cannot sign in. Acceptable for a Base-targeted MiniApp.

---

## ADR-002 — Monorepo with pnpm workspaces
**Date**: 2026-05-22
**Status**: Accepted

**Context**
Frontend (Next.js) and contracts (Foundry) live in the same repo. Single-package layout mixes Node and Solidity tooling at the root; monorepo isolates them.

**Decision**
Use **pnpm workspaces**: `apps/web/` for the Next.js app, `packages/contracts/` for Foundry. Root `package.json` holds only orchestration scripts and shared dev dependencies.

**Consequences**
- `pnpm -r build`, `pnpm -r typecheck` fan out across packages.
- Foundry's `lib/` and `out/` stay scoped under `packages/contracts/`.
- Future packages (shared types, SDK) can be added without restructuring.

---

## ADR-003 — Backend cache on VPS, not Vercel serverless
**Date**: 2026-05-22
**Status**: Accepted

**Context**
External API calls (Alchemy, CDP, BaseScan) must be cached to avoid quota burn. Options: Vercel Edge Functions + Upstash Redis, or VPS-hosted Node + local Redis.

**Decision**
Cache layer runs on **VPS with local Redis**. Vercel hosts only the Next.js frontend. The Next.js API routes act as a thin proxy to the VPS backend.

**Consequences**
- One more deployment target (VPS) and one more failure surface.
- Lower latency cache hits (Redis on localhost vs. Upstash over the network).
- No Vercel KV / Upstash cost concerns.
- CLAUDE.md mandates this; revisit only with explicit decision update.

---

## ADR-004 — Backend API style: Next.js Route Handlers proxying to VPS
**Date**: 2026-05-22
**Status**: Accepted

**Context**
The browser needs to call portfolio/gas/score endpoints. Direct browser → VPS introduces CORS, exposes the VPS URL, and complicates auth.

**Decision**
Use **Next.js App Router Route Handlers** (`app/api/*`) that proxy to the VPS. Types are shared via a future `packages/shared` workspace. Auth context flows server-side; the VPS only accepts requests signed by the Next.js server.

**Consequences**
- No tRPC for v1 — overkill for the surface area.
- No CORS config needed on the VPS (private origin).
- Adds a hop, but caching makes it negligible.

---

## ADR-005 — Session storage: iron-session
**Date**: 2026-05-22
**Status**: Accepted

**Context**
After SIWB verification, the server needs to persist authenticated state. Options: `iron-session` (sealed cookie, stateless), Redis-backed session, NextAuth.

**Decision**
Use **`iron-session`**. Cookie holds the authenticated address sealed with a server secret. No DB needed.

**Consequences**
- Logout = clear cookie. No server-side revocation list (acceptable for v1).
- Session secret in `SIWE_SESSION_SECRET` env, rotated manually.
- If we later need per-session features (rate-limit by address, audit), revisit.

---

## ADR-006 — Client state: wagmi + TanStack Query only
**Date**: 2026-05-22
**Status**: Accepted

**Context**
wagmi ships with TanStack Query under the hood. The temptation to add Zustand / Jotai for "global UI state" exists.

**Decision**
No additional global state library in v1. wagmi handles wallet state, TanStack Query handles server cache, React state handles UI. If a concrete need emerges (multi-step forms, complex modals), revisit with an ADR.

**Consequences**
- One fewer dependency to track and update.
- Some prop drilling acceptable; component composition handles most cases.

---

## ADR-007 — `.agents/skills/` is git-ignored; only `skills-lock.json` is committed
**Date**: 2026-05-22
**Status**: Accepted

**Context**
`npx skills add base/skills` installed 10 skills to `.agents/skills/` (~MBs of markdown + symlinks for other AI tools). The lockfile `skills-lock.json` records exact versions.

**Decision**
- `.agents/skills/` → gitignored.
- `skills-lock.json` → committed.
- Skills are reinstalled by anyone cloning via `pnpm install` postinstall hook (TBD) or manually via `npx skills install`.

**Consequences**
- Smaller, cleaner repo.
- Reproducibility via lockfile, same model as `node_modules` + `pnpm-lock.yaml`.
- If `skills` CLI breaks the lockfile format, we may need to pin a specific CLI version.

---

## ADR-008 — Pin to 2026-05 ecosystem versions, not 2024 versions
**Date**: 2026-05-22
**Status**: Accepted

**Context**
The initial Phase 1 plan pinned versions that were current ~2024: Next 14, React 18, wagmi 2.x, viem 2.21, `@base-org/account` 1.0.4. The npm registry rejected `@base-org/account@1.0.4` — current is 2.5.6. The whole stack has moved forward.

**Decision**
Pin to current 2026-05 versions:
- `next@16.2.6` (Turbopack default, React 19 default)
- `react@19.2.6`, `react-dom@19.2.6`
- `wagmi@3.6.15` (requires TS ≥ 5.7.3)
- `viem@2.50.4`
- `@base-org/account@2.5.6`, `@base-org/account-ui@1.0.1`
- `@tanstack/react-query@5.59.20`
- `iron-session@8.0.4`
- `typescript@5.7.3`

**Consequences**
- Next 16 made `cookies()` async — `await cookies()` everywhere.
- React 19 type changes — `@types/react@19.x` required.
- `SignInWithBaseButton` v1.x dropped `size` prop.
- Future bumps should be deliberate; pin exact versions, no `^` ranges, document changes here.

