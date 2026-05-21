# BasePulse

Utility MiniApp for the Base ecosystem — portfolio tracking, gas optimization, and onchain score monitoring in one place. Built as a standard web app (post April 2026 spec) deployable on Base.dev and Farcaster from a single codebase.

> Status: **Phase 0 — bootstrap**. Not yet live.

## What it does
- **Portfolio**: token balances + DeFi positions (Aerodrome, Morpho) for any Base wallet.
- **Gas**: 7-day Base gas history with percentile-based "good time to transact" signal.
- **Score**: onchain reputation breakdown with shareable cards for Farcaster and X.
- **Snapshot**: optional onchain commit of your portfolio state (Base L2 contract).

## Stack
Next.js 14 · TypeScript strict · wagmi + viem · Base Account SDK · SIWB · Foundry · Tailwind + shadcn/ui · Vercel (frontend) · VPS + Redis (cache).

## Repo layout
```
apps/web/          Next.js 14 frontend + API routes
packages/contracts Foundry workspace for Solidity
docs/              Decisions, incident logs, builder-score log
```

## Local development
Requires Node 22+, pnpm 11+, Foundry, Redis.

```bash
pnpm install
pnpm dev
```

## Docs
- [`CLAUDE.md`](./CLAUDE.md) — project contract, hard rules.
- [`ROADMAP.md`](./ROADMAP.md) — 8-phase delivery plan.
- [`docs/decisions.md`](./docs/decisions.md) — architecture decision records.
- [`docs/builder-score-log.md`](./docs/builder-score-log.md) — weekly Builder Score tracking.

## License
MIT.
