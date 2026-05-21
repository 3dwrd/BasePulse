# BasePulse — Project Context

## What this is
A utility MiniApp for the Base ecosystem combining portfolio tracking, gas optimization alerts, and onchain score monitoring. Built as a standard web app per Base's April 2026 migration spec, deployable on Base.dev and Farcaster from a single codebase.

## Strategic goals (priority order)
1. Qualify for Base Builder Rewards (top 100 weekly, 2 ETH pool via talent.app).
2. Position the developer's wallet for the speculated Base airdrop (Q2–Q4 2026).
3. Generate organic Builder Score signals: contract deploys + MiniApp usage + GitHub activity.

## Stack (non-negotiable)
- Framework: Next.js 14 App Router, TypeScript strict mode.
- Wallet/auth: wagmi + viem + Base Account SDK + SIWE (server-side session).
- Smart contracts: Foundry, Solidity ^0.8.24.
- Hosting: Vercel (frontend) + VPS (Node cache/API + Redis).
- Data: Alchemy free tier (portfolio), CDP RPC (Base), Etherscan/BaseScan API (gas), onchainscore.xyz (score).
- UI: shadcn/ui + Tailwind. Avoid generic AI aesthetic.
- Distribution: Base.dev primary, Farcaster Mini App secondary, single codebase.
- Identity: Basename, Human Checkmark, talent.app profile.

## Hard rules
- NEVER commit `.env*` files or secrets. `.gitignore` is set up before the first commit.
- Wallet private keys live ONLY in the developer's password manager. Never in code, chat, or CI.
- All mainnet deploys require **explicit human confirmation in terminal**. Testnet first, always.
- Builder Codes integrated from contract v0.1, not retrofitted.
- Type-safe end to end. No `any` escape hatches. No deprecated Farcaster SDK methods.
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
