# BasePulse — Project Context

## What this is
A utility **web app** for the Base ecosystem combining portfolio tracking, gas optimization alerts, and onchain score monitoring. Built as a standard web app per Base's April 2026 migration spec. Live at https://basepulse.botsniper.xyz.

Not a Farcaster Mini App. Base killed its social pillar (Creator Rewards + Farcaster feed off since Feb 2026; Pollak stepped off Base App in Jul 2026) and refocused on trading / payments / AI agents — BasePulse sits in the trading-utility pillar. Packaging for Farcaster is explicitly out of scope; posting links there is free and fine, engineering for it is not.

## Strategic goals (priority order)
1. Position the developer's wallet for the speculated Base airdrop (still no token, no criteria as of Jul 2026).
2. Stay discoverable for retroactive Builder Grants (Builder Code registered: `bc_bo6g6vzn`).
3. Generate organic Builder Score signals: contract deploys + real app usage + GitHub activity.

Note: Base Builder Rewards status is unconfirmed — the Jan 2026 "Base Campaign Has Ended" notice conflicts with later signals of an active pool. Verify at `dashboard.base.org/leaderboard` or `talent.app/earn` before treating it as income.

## Stack (non-negotiable)
- Framework: Next.js 16 App Router, TypeScript strict mode.
- Wallet/auth: wagmi + viem + Base Account SDK + SIWE (server-side session).
- Smart contracts: Foundry, Solidity ^0.8.24.
- Hosting: self-hosted on the VPS (pm2 + nginx + certbot) — web :3200, cache :4000, `basepulse-redis` :6391. Supersedes the original Vercel plan in ADR-003.
- Data: Alchemy free tier (portfolio), CDP RPC (Base), Etherscan/BaseScan API (gas), onchainscore.xyz (score).
- UI: shadcn/ui + Tailwind. Avoid generic AI aesthetic.
- Distribution: Base Dashboard (`dashboard.base.org`, ex-base.dev) primary; DappRadar listing drafted; links posted to Farcaster/X as plain posts. No Mini App packaging.
- Identity: Basename, Human Checkmark, talent.app profile.

## Hard rules
- NEVER commit `.env*` files or secrets. `.gitignore` is set up before the first commit.
- Wallet private keys live ONLY in the developer's password manager. Never in code, chat, or CI.
- All mainnet deploys require **explicit human confirmation in terminal**. Testnet first, always.
- Builder Codes integrated from contract v0.1, not retrofitted.
- Type-safe end to end. No `any` escape hatches.
- One commit per logical change. Conventional commits format.
- If a verification step at the end of a Phase fails, revert the branch — do not merge to main.

## Development principles
- Plan before code. When given a feature, propose structure first, await approval, then implement.
- Read installed Base skills before generating boilerplate. Don't reinvent what's documented.
- Small, verifiable commits. Each feature in its own branch.
- If something contradicts `CLAUDE.md` or `ROADMAP.md`, flag it before proceeding — do not silently resolve.
- If an external command (e.g., `npx skills add base/skills`) fails, report the exact error and propose alternatives. Do not retry blindly.

## RPC / cost discipline
- Every external API call routes through the VPS cache (Redis), never direct from the browser.
- Default Redis TTLs: portfolio 5 min, gas 15 s, score 1 h. Document any deviation in the PR.
- Batch RPC requests where viable. Alchemy free tier is 300M CU/month — budget it.

## What we are NOT doing
- Multi-wallet Sybil farming. One identity, one wallet, real activity.
- Spam contract deploys. One well-used contract beats fifty empty ones.
- Generic copy-paste UI components.
- Token launches, memecoins, paid tiers in v1.
- Native mobile apps (web works everywhere).
