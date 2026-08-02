# Base.dev project submission — copy-paste ready

Prepared 2026-08-02. Submit at **https://dashboard.base.org** (ex-base.dev) → create/complete
the project. The Builder Code `bc_bo6g6vzn` is already registered there; this is the *project
metadata* step, which is separate and is what makes the app discoverable inside Base App.

**Why this one matters more than it looks:** since **2026-04-09** the Base App treats every app
as a standard web app and ignores Farcaster manifests. Base's own migration guide says
discovery moved from "search via Farcaster" to "**Base.dev app metadata + builder codes**". So
this form *is* the modern replacement for mini-app packaging — there is no other listing surface
inside Base App. It is also step 1 of the rewards path (`docs.base.org/mini-apps/growth/rewards`:
verify the app on Base.dev + attach a builder address, then partner programs/competitions).

---

## Images

| Asset | Where | Notes |
| --- | --- | --- |
| Icon / logo (1024×1024 PNG) | `https://basepulse.botsniper.xyz/logo-1024.png` — file at `apps/web/public/logo-1024.png` | Mark fills ~78% of the frame so it survives a 64px thumbnail. Same identity as the old `icon.png`, which left half the canvas empty. |
| Icon 250×250 | `https://basepulse.botsniper.xyz/logo-250.png` | For forms that cap size. |
| Screenshots (portrait 1284×2778) | `docs/assets/basedev/portrait-{1-home,2-score,3-gas}.png` | Base App is mobile-first — use these when the form shows phone frames. |
| Screenshots (desktop 1280×800) | `docs/assets/basedev/desktop-{1-home,2-score,3-gas}.png` | For directories that want landscape (DappRadar, ecosystem form). |

All screenshots captured 2026-08-02 from the live site, so they include the signed-out onchain
snapshot block and the wallet search bar.

## Fields

| Field | Value |
| --- | --- |
| Name | BasePulse |
| Primary URL | `https://basepulse.botsniper.xyz` |
| Category | Consumer (fallback: Infra / Tools if Consumer isn't offered) |
| Builder Code | `bc_bo6g6vzn` |
| Contract | `0xd2240b90486F63858ED823a2620cb6DC6FcB6019` (Base mainnet, verified) |
| Farcaster | `@usebasepulse` |
| Contact | hersonc00@proton.me |

## Tagline (short, ~40–60 chars)

```
Portfolio, gas and onchain score for Base
```

Alternate if the field allows more:

```
Check any Base wallet — score, portfolio, gas timing
```

## Brief description (1–2 sentences)

```
Paste any Base wallet address and get its onchain score, its token portfolio, and a gas tracker with 7 days of history so you know when fees are actually low. No signup and no wallet connection needed to look up an address.
```

## Full description

```
BasePulse is a free utility dashboard for Base.

Paste any Base address to see three things: an onchain reputation score broken down by what actually drives it (Base activity, token diversity, L1 history, bridging) with a list of what's missing; the wallet's token portfolio; and a gas-fee tracker that keeps 7 days of history, so you get timing guidance instead of a live number you can't act on. Every score page renders a shareable card for X and Farcaster.

Nothing is gated: no signup, no account, and no wallet connection to look up an address. Connecting a wallet is optional and only needed to view your own portfolio or to seal a snapshot of your holdings onchain — the contract stores a keccak256 fingerprint, never balances or amounts.

The app takes no custody of funds and never requests a token approval. Its single contract, PortfolioSnapshot, is an append-only ledger verified on BaseScan.
```

## If there's a free-text "why does this fit Base" field

```
Base's 2026 refocus named trading, payments and AI agents as its pillars. BasePulse is a trading-utility dashboard — wallet analytics and fee timing — so it sits in a current pillar rather than the social one that was wound down. It is a standard web app built on wagmi/viem + Base Account SDK, with a verified mainnet contract and a registered builder code.
```

## Honest state, in case a reviewer asks

- Live since 2026-07-27, self-hosted (pm2 + nginx), all routes 200.
- Real usage so far: 1 recorded snapshot (the maker's own), publicly verifiable at
  `basescan.org/tx/0x09cb992c3c9d45689a3915839cc8ddc4bdc4d03a033a86e2b9e3980fa2a92c60`.
  Do not claim traction that doesn't exist — first posts went out 2026-08-02.
