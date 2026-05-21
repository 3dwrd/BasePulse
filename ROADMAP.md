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

### Phase 0 — Identity & infrastructure (Week 1)
**Goal**: be eligible for Builder Rewards from day 1 of building.
- [ ] `nvm install 22 && nvm use 22` (current VPS has v20).
- [ ] Install Foundry (`foundryup`) and verify `forge --version`.
- [ ] Install Redis locally on VPS, confirm `redis-cli ping`.
- [ ] Register Basename (`*.base.eth`) on farming wallet.
- [ ] Create talent.app profile; connect wallet + GitHub + Farcaster + X.
- [ ] Complete Human Checkmark.
- [ ] Record baseline Builder Score in `docs/builder-score-log.md`.
- [ ] Validate `npx skills add base/skills`. If it fails, document the actual install path (clone repo, copy to `.claude/skills/`).
- [ ] Initialize repo with `CLAUDE.md`, `ROADMAP.md`, `.gitignore`, `.env.example`, `LICENSE` (MIT). First commit.
- [ ] Create Vercel project, link to repo.
- [ ] Reserve domain (basepulse.app / basepulse.xyz / fallback).

**Verification**: Builder Score visible on talent.app, identity links confirmed, repo pushed, `forge`/`redis-cli`/`node -v` all green.

### Phase 1 — Frontend foundation (Week 2)
**Goal**: shippable shell with wallet connection and routing.
- [ ] Next.js 14 scaffold, strict TS, ESLint + Prettier.
- [ ] Tailwind + shadcn/ui configured.
- [ ] wagmi config for Base mainnet + Base Sepolia.
- [ ] Base Account SDK integration.
- [ ] SIWE flow with server-side session (NextAuth or custom).
- [ ] Layout: header (wallet connect), sidebar (route nav).
- [ ] Placeholder routes: `/portfolio`, `/gas`, `/score`.
- [ ] Vercel preview deploy.

**Verification**: connect wallet, SIWE sign-in, authenticated state persists across routes.

### Phase 2 — Portfolio module (Week 2–3)
**Goal**: real data for connected wallet.
- [ ] VPS backend: Alchemy token balances endpoint (Redis TTL 5 min).
- [ ] Subgraph queries: Aerodrome positions.
- [ ] Subgraph queries: Morpho / Aave lending positions.
- [ ] UI: tokens table, positions cards, total USD value.
- [ ] Loading states + error boundaries.

**Verification**: real Base wallet → accurate portfolio shown.

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
