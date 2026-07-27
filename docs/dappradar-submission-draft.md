# DappRadar submission draft

Prepared 2026-07-27. Fields per DappRadar's self-service form (dappradar.com/submit-a-project)
— login required (email or wallet), so this is a copy-paste draft, not auto-submitted.
DeBank and DeFiLlama were considered and dropped: both index protocols by TVL/locked
value, and BasePulse doesn't hold funds (read-only dashboard) — no TVL to report, so
neither fits until/unless that changes.

## Core fields

- **Project name**: BasePulse
- **Website**: https://basepulse.botsniper.xyz
- **Chain**: Base
- **Status**: Released / Live
- **Smart contract**: `0xd2240b90486F63858ED823a2620cb6DC6FcB6019` (`PortfolioSnapshot`,
  verified on Base mainnet — https://basescan.org/address/0xd2240b90486F63858ED823a2620cb6DC6FcB6019)

## Tagline (short description)

> Portfolio, gas timing, and onchain score for Base — paste any wallet, no account needed.

## Full description

> BasePulse is a free utility dashboard for the Base ecosystem. Paste any Base wallet
> address to see its token portfolio, a gas-fee tracker with 7-day historical
> recommendations (low/normal/high), and an onchain reputation score with a breakdown of
> what's driving it — Base activity, token diversity, L1 history, and bridging. Every
> score page has a shareable card built for X and Farcaster. No signup, no wallet
> connection required to look someone up — connect only if you want to check your own
> wallet via Base Account, MetaMask, Coinbase Wallet, or WalletConnect.

## Category

Main category (pick closest available on the actual dropdown, exact taxonomy not
confirmed — likely **"Tools"** or **"Other"**, sub-category **"Portfolio Tracker" /
"Analytics"** if offered).

## Tags (up to 5)

`portfolio-tracker`, `gas-tracker`, `onchain-score`, `base`, `wallet-lookup`

## Social links

**Gap — none exist yet.** No X/Farcaster account for BasePulse itself has been created.
DappRadar's form has a social-links field; leaving it blank is fine for submission, but
worth deciding whether to spin up an account before or after listing.

## Assets (ready to attach)

All under `docs/assets/dappradar/` in this repo:

- `logo-250.png` — 250×250 PNG, resized from `apps/web/public/icon.png`, 25KB (under
  DappRadar's 150KB cap)
- `screenshot-1-home.png` — home page + wallet search bar
- `screenshot-2-score.png` — score page (breakdown + share buttons)
- `screenshot-3-gas.png` — gas tracker
- No YouTube video / demo clip — optional field, skip unless one gets made later.

## Still needed to actually submit

1. A DappRadar account (email or wallet login) — human step, not something to create on
   your behalf.
2. Final category pick from the real dropdown (couldn't confirm exact taxonomy — their
   docs subdomain and submission page both blocked automated fetches).
3. Decision on the social-links gap above.
