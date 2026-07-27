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

**Decided 2026-07-27, not yet created (human step — needs phone verification, can't be
automated):**
- **Farcaster**: new account, username `@usebasepulse` (exact `basepulse` was already
  registered by someone else — confirmed via the public fname registry), display name
  "BasePulse", PFP = `docs/assets/dappradar/logo-250.png`, bio: "Portfolio, gas timing,
  and onchain score for Base. Check any wallet, free." + link to
  `basepulse.botsniper.xyz`.
- **X**: no new account — posts from the owner's existing personal account, no dedicated
  BasePulse handle.
- Deliberately NOT mixed with the unrelated "Mister Cínico" persona bot (different
  product, different audience) even though both would ride on the same Postiz publishing
  hub — same one-account-per-brand pattern used everywhere else.
- Once `@usebasepulse` exists, add its link here and to the site's footer/bio if one
  gets added. `basepulse.com` was checked and is unrelated (registered since 2012,
  actively used by someone else) — `basepulse.botsniper.xyz` stays the canonical link
  everywhere.

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
