# Session Notes

Append-only log of what actually happened in each working session — surprises, decisions made on the fly, commands that worked, things that broke. Survives between Claude Code sessions.

Format: one section per Phase, dated. Newest at the bottom.

---

## 2026-05-22 — Phase 0 (bootstrap)

**Goal**: scaffold the repo and validate the toolchain.

**What got built**
- `CLAUDE.md`, `ROADMAP.md`, `LICENSE`, `.gitignore`, `.env.example`.
- Monorepo layout: `pnpm-workspace.yaml` (apps/*, packages/*), root `package.json`.
- `docs/decisions.md` with ADR-001 through ADR-007.
- `docs/builder-score-log.md` (baseline pending until Basename + talent.app).
- `docs/incident-template.md`.
- Base skills installed via `npx skills add base/skills` (10 skills → `.agents/skills/`, gitignored; `skills-lock.json` committed).

**Environment surprises**
- Node v20 was the system default; bumped to v22.22.3 via `nvm install 22 && nvm alias default 22`.
- pnpm was tied to Node 20's prefix; reinstalled under Node 22 (`npm i -g pnpm` → 11.2.2).
- Foundry not installed; `curl -L https://foundry.paradigm.xyz | bash && foundryup` → 1.7.1. Installer added `~/.foundry/bin` to `~/.bashrc`; also added to `~/.profile` so non-interactive shells see it.
- Redis not installed; `apt-get install -y redis-server` → 7.0.15. Enabled via systemd (`systemctl enable --now redis-server`).
- First `npx skills add base/skills` attempt aborted by timeout mid-write — retry without timeout completed.

**Commits**
- `132942d` chore: bootstrap repo with CLAUDE.md, ROADMAP.md, gitignore, env example, license
- `6cfc842` chore(phase-0): monorepo scaffold, ADRs, builder-score log, skills lock

**Verification** ✅ — node v22, pnpm 11.2, forge 1.7.1, redis PONG, all docs present.

**Pending human steps** (don't block Phase 1 technically)
- Register Basename on farming wallet.
- Create talent.app profile, connect wallet + GitHub + Farcaster + X.
- Complete Human Checkmark.
- Reserve domain (basepulse.app / .xyz).
- Push repo to GitHub, link Vercel project.

---

## 2026-05-22 — Phase 1 (Next.js shell + SIWB auth)

**Goal**: shippable shell with wallet connection and routing.

**What got built**
- `apps/web/` Next.js 16 App Router with strict TS, Tailwind, ESLint.
- `lib/wagmi.ts`: Base Account SDK + wagmi config for Base mainnet + Base Sepolia.
- `lib/session.ts`: iron-session helper, runtime-guarded `SIWE_SESSION_SECRET`.
- `lib/nonce-store.ts`: in-memory Map with 5-min TTL (to be migrated to Redis in Phase 2).
- API routes: `GET /api/auth/nonce`, `POST /api/auth/verify`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `components/providers.tsx`: WagmiProvider + QueryClientProvider, SSR-safe via `useEffect` mount gate.
- `components/wallet-connect.tsx`: SignInWithBaseButton + sign-out, talks to `/api/auth/*`.
- `components/nav-sidebar.tsx`: links to /portfolio /gas /score.
- Pages: `/`, `/portfolio`, `/gas`, `/score` (placeholders for later Phases).
- `next.config.mjs`: sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` (required by Base popup, per the `building-with-base-account` skill).

**Decisions made on the fly**
- **Version bumps**: the versions I originally pinned (next 14, wagmi 2, viem 2.21, react 18, `@base-org/account` 1.0.4) were stale for 2026-05. The ecosystem is now on Next 16, wagmi 3, viem 2.50, React 19, `@base-org/account` 2.5.6. Recorded in **ADR-008**.
- **Mount-gate in `Providers`**: Base Account SDK throws if called without `window`. Wrapped config creation in `useEffect` so SSR builds don't try to instantiate it. Side effect: `useAccount()` returns disconnected during the brief hydration window — acceptable.
- **`SIWE_SESSION_SECRET` guard moved to runtime**: at module-load time it threw during `next build` (because Next.js classifies the build process as production). Now `getSessionOptions()` is called inside route handlers only.
- **Dev port = 3200**: VPS has 3000 (docker-proxy from another project) and 3100 (a python service) already bound. Phase 2+ should standardize on 3200 for local dev.

**Bugs hit + fixes**
- `cookies()` is async in Next 16 → `await cookies()` in `getSession()`.
- `SignInWithBaseButton` v1.0.1 dropped the `size` prop → removed it.
- Build prerendered `/_not-found` and ran Providers in SSR → mount-gate fix above.

**Commits**
- `3b1f97a` feat(phase-1): Next.js 16 shell with wagmi, Base Account SDK, SIWB auth

**Verification** ✅
- `pnpm typecheck` → clean.
- `pnpm build` → 8 routes built (4 static, 4 dynamic).
- `pnpm start` on PORT=3200 → all routes 200, all API routes return expected shapes, COOP header present.
- Production guard verified: starts fail without `SIWE_SESSION_SECRET`, succeed with one.

**NOT verified (needs browser + real wallet)**
- End-to-end SIWB flow with a real Base smart wallet popup. Deferred to first Vercel preview deploy.

**Pending for Phase 2**
- Migrate `nonce-store.ts` from in-memory Map to Redis (so it survives reloads and scales across instances).
- Stand up the VPS-side Node + Redis cache layer.
- Wire Alchemy token balances behind a Next.js Route Handler that proxies the VPS.

---

## 2026-05-22 — Phase 2 (Portfolio + VPS cache)

**Goal**: real (or mock) portfolio data behind a cache, end-to-end through the VPS.

**What got built**
- New workspace `services/cache/` (Fastify 5.8.5, ioredis 5.10.1, tsx for dev).
  - `GET /health` (public) returns `{ok, mock, redis}`.
  - `GET /v1/tokens/:chainId/:address` requires `x-internal-token` header, returns `{tokens, fetchedAt}` with `x-cache: HIT|MISS`.
  - Alchemy integration with mock fallback when `ALCHEMY_API_KEY` is empty.
  - Redis TTL: 300 s for token balances.
- `apps/web/lib/redis.ts`: global ioredis singleton (avoids reconnect storms in dev).
- `apps/web/lib/nonce-store.ts`: migrated to Redis (`siwb:nonce:*`, 5 min TTL).
- `apps/web/lib/cache-client.ts`: typed client to the cache service.
- `apps/web/lib/format.ts`: `formatBalance` for BigInt → human string.
- `apps/web/app/api/portfolio/route.ts`: session-gated proxy.
- `apps/web/app/portfolio/page.tsx`: client component using TanStack Query, skeleton + refresh button.

**Decisions made on the fly**
- Added third workspace dir `services/*` to `pnpm-workspace.yaml`.
- `INTERNAL_API_TOKEN` is a single shared secret (web ↔ cache). Generated with `openssl rand -hex 24`. Both `.env.local` and `services/cache/.env` hold the same value. Production deploy will swap to a per-environment secret.
- Cache service log level: `debug` in dev, `info` in prod. Default port 4000 (configurable via `CACHE_PORT`).
- Mock data covers USDC, WETH, AERO with realistic Base mainnet addresses, so the UI looks alive without Alchemy.
- `redis-cli` confirms keys land where expected (`tokens:8453:0x…`, `siwb:nonce:…`).
- `pnpm-workspace.yaml` got a couple of `allowBuilds` entries (`esbuild`, `sharp`, `unrs-resolver`) — pnpm 11's new safer default.

**Commits**
- `fc7727a` feat(phase-2): portfolio module with VPS cache service + Redis

**Verification** ✅
- `pnpm typecheck` + `pnpm build` clean (9 routes including `/api/portfolio`).
- Cache service `/health` → `mock=true`, `redis=ready`.
- Unauthorized cache request → 401.
- Authorized request → 200 with `x-cache: MISS` then `HIT` on second call (≤ 300 s).
- `/api/portfolio` returns 401 without session, would proxy with one.
- Page `/portfolio` renders 200 (skeleton/error states wired).

**NOT verified (needs browser + real wallet)**
- Logged-in `/portfolio` end-to-end. Same blocker as Phase 1 — needs SIWB popup completion in a real browser.

**Pending for Phase 2.5 (subgraphs)**
- Aerodrome positions query.
- Morpho lending positions query.
- USD valuations (Alchemy `getTokenPrices` or DeFiLlama as fallback).
