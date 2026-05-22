# BasePulse — Project Roadmap

## Vision
A utility MiniApp for Base ecosystem users that combines portfolio tracking, gas optimization, and onchain reputation monitoring. Built as a standard web app (post April 9, 2026 spec) deployable simultaneously on Base.dev and Farcaster.

## Why this exists (strategic context)
- **Primary**: qualify for Base Builder Rewards (weekly 2 ETH pool, top 100 builders via talent.app).
- **Secondary**: position the developer wallet for the speculated Base token airdrop (Q2–Q4 2026).
- **Tertiary**: build a real, useful tool that can attract organic users.

## Success metrics (realistic targets)
- Builder Score: baseline recorded week 1, ≥ 25 by week 6, ≥ 40 by week 8–10.
- App live on Base.dev by end of week 6.
- At least 1 verified smart contract on Base mainnet by end of week 5.
- At least 1 merged PR to a Base ecosystem repo by end of week 8.
- At least 50 unique wallet addresses interacting with the deployed contract by end of week 8.

## Technical stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Standard for Base.dev, SSR/ISR support |
| Language | TypeScript strict | Type safety with viem contracts |
| Wallet/Auth | wagmi + viem + Base Account SDK + SIWE | Post-April-2026 spec, no Farcaster SDK lock-in |
| Smart contracts | Foundry + Solidity ^0.8.24 | Fast tests, scriptable deploys |
| Frontend | shadcn/ui + Tailwind | Distinctive UI, fast iteration |
| Backend cache | Node + Redis on VPS | Avoid Alchemy rate limit burn |
| Hosting | Vercel + VPS | Free tier + flexibility |
| Data | Alchemy, CDP RPC, BaseScan API, onchainscore.xyz | All free tiers |
| Distribution | Base.dev + Farcaster Mini App | Single codebase, dual surface |

## Phase plan (8 weeks, 5–10 hrs/week)

### Phase 0 — Identity & infrastructure (Week 1) — **CLOSED 2026-05-22 (technical)**
**Goal**: be eligible for Builder Rewards from day 1 of building.
- [x] `nvm install 22 && nvm use 22` (was v20 → v22.22.3).
- [x] Install Foundry (`foundryup`) and verify `forge --version` (1.7.1).
- [x] Install Redis locally on VPS, confirm `redis-cli ping` (7.0.15).
- [ ] Register Basename (`*.base.eth`) on farming wallet. *(human pending)*
- [ ] Create talent.app profile; connect wallet + GitHub + Farcaster + X. *(human pending)*
- [ ] Complete Human Checkmark. *(human pending)*
- [ ] Record baseline Builder Score in `docs/builder-score-log.md`. *(human pending)*
- [x] Validate `npx skills add base/skills` — 10 skills installed to `.agents/skills/`, `skills-lock.json` committed.
- [x] Initialize repo with `CLAUDE.md`, `ROADMAP.md`, `.gitignore`, `.env.example`, `LICENSE` (MIT). First commit.
- [ ] Create Vercel project, link to repo. *(deferred until GitHub push)*
- [ ] Reserve domain (basepulse.app / basepulse.xyz / fallback). *(human pending)*

**Verification**: Builder Score visible on talent.app, identity links confirmed, repo pushed, `forge`/`redis-cli`/`node -v` all green.
**Status**: technical scaffold ✅. Identity + hosting deferred to be done in parallel with Phase 1+.

### Phase 1 — Frontend foundation (Week 2) — **CLOSED 2026-05-22 (local)**
**Goal**: shippable shell with wallet connection and routing.
- [x] Next.js **16** scaffold, strict TS, ESLint. *(version bumped per ADR-008)*
- [x] Tailwind configured. *(shadcn/ui deferred until first component need)*
- [x] wagmi config for Base mainnet + Base Sepolia.
- [x] Base Account SDK integration (`@base-org/account` 2.5.6).
- [x] **SIWB** flow with server-side session via iron-session (per ADR-001 + ADR-005).
- [x] Layout: header (wallet connect), sidebar (route nav).
- [x] Placeholder routes: `/portfolio`, `/gas`, `/score`.
- [ ] Vercel preview deploy. *(deferred until GitHub push)*

**Verification**: build clean, all routes 200, `/api/auth/*` endpoints return expected shapes, COOP header set. End-to-end SIWB with a real wallet popup deferred to first hosted deploy.

### Phase 2 — Portfolio module (Week 2–3) — **CLOSED 2026-05-22 (token balances)**
**Goal**: real data for connected wallet.
- [x] VPS backend: Alchemy token balances endpoint (Redis TTL 5 min) — Fastify cache service on :4000 with mock fallback.
- [ ] Subgraph queries: Aerodrome positions. *(Phase 2.5)*
- [ ] Subgraph queries: Morpho / Aave lending positions. *(Phase 2.5)*
- [x] UI: tokens table with skeleton + refresh; total USD value deferred until prices integration.
- [x] Loading states + error boundaries.

**Verification**: build clean, `/health` returns mock=true & redis ready, cache MISS→HIT confirmed via header, `/api/portfolio` session-gated. Real-wallet visual check deferred to first hosted preview.

### Phase 3 — Gas tracker (Week 3)
**Goal**: actionable gas recommendations.
- [ ] CDP RPC gas polling (Redis TTL 15 s).
- [ ] 7-day historical store.
- [ ] Percentile-based recommendation engine.
- [ ] UI: current gas + 24h chart + recommendation badge.
- [ ] Email/push alerts deferred to v1.1.

**Verification**: 7-day chart populated, recommendation updates live.

### Phase 4 — Score tracker + share card (Week 4)
**Goal**: the differentiator. Viral component.
- [ ] onchainscore.xyz integration (API or scraping fallback).
- [ ] Score breakdown (tx count, diversity, bridging, L1 history).
- [ ] "What's missing" recommendations.
- [ ] Dynamic OG image generator for Farcaster/X share.
- [ ] Public `/score/[address]` route.

**Verification**: share own score as cast/tweet, OG image renders.

### Phase 5a — Contract on testnet (Week 4–5)
**Goal**: Solidity work proven on Sepolia.
- [ ] Foundry project under `/contracts`.
- [ ] `PortfolioSnapshot.sol`: stores keccak hash + timestamp + BuilderCode attribution.
- [ ] Full unit test coverage.
- [ ] Deploy Base Sepolia, verify on BaseScan.
- [ ] Frontend wiring: snapshot button → tx → confirmation.

**Verification**: end-to-end snapshot flow works on Sepolia, contract verified.

### Phase 5b — Paymaster + mainnet (Week 5)
**Goal**: gasless UX + real mainnet activity.
- [ ] CDP Paymaster integration (gasless txs).
- [ ] Mainnet deploy script with **interactive confirmation prompt**.
- [ ] Deploy + verify on BaseScan mainnet.
- [ ] Smoke test from production frontend.

**Verification**: real wallet, real mainnet tx, sponsored by paymaster, verified contract.

### Phase 6 — Distribution (Week 5–6)
**Goal**: discoverable across surfaces.
- [ ] Register on Base.dev (name, icon, screenshots, description, category, builder code).
- [ ] Farcaster Mini App compat (conditional rendering on single codebase).
- [ ] Launch cast on Farcaster + thread on X.
- [ ] Post in `/base`, `/developers`, `/onchain-data` channels.
- [ ] Submit to Base.dev featured/curated lists.

**Verification**: app reachable from Base App search, Farcaster feed, direct URL.

### Phase 7 — Iteration + ecosystem PRs (Week 6–8)
**Goal**: sustained signal for Builder Score and airdrop.
- [ ] 1 feature/week based on user feedback.
- [ ] Monthly PR to ecosystem repo (`coinbase/onchainkit`, `base/node`, `farcasterxyz/miniapps`).
- [ ] Daily Farcaster build-in-public engagement.
- [ ] Weekly Builder Score log update.
- [ ] Track Builder Rewards leaderboard.

**Verification**: Score trending up, usage growing, ≥ 1 merged ecosystem PR.

## What success looks like at week 8
- BasePulse live on Base.dev and Farcaster.
- Smart contract deployed and used by real wallets.
- Builder Score ≥ 40, ideally top 500 monthly bracket.
- Verifiable ecosystem contributions.
- Wallet positioned with retail + builder signals for any airdrop snapshot.

## Rollback policy
If a Phase fails its verification step:
1. Do not merge the branch.
2. Open a `docs/incident-<phase>.md` describing what failed and why.
3. Reassess scope before retrying — split the Phase if needed.

## Out of scope (explicit non-goals)
- Multi-wallet farming or Sybil strategies.
- Token launches or memecoin features.
- Generic copy-paste UI.
- Premium/paid tiers in v1.
- Native mobile apps.
