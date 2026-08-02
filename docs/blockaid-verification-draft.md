# Blockaid verification — copy-paste draft

Prepared 2026-08-02. Submit at **https://report.blockaid.io/** → choose the **Developer**
path ("verify a project to prevent false malicious flags"). If a warning is already showing
in a specific wallet, use **https://report.blockaid.io/mistake** instead.

Why this one first: Blockaid powers the security warnings in MetaMask, Coinbase Wallet and
others, and Base's own guidance
(`docs.base.org/base-chain/security/avoid-malicious-flags`) points here explicitly. Every
other listing is discovery; this one is the thing that stops a first-time visitor from
seeing a red alert.

**Requires a human**: the form needs an account/contact email. Nothing here is secret —
every value below is already public onchain or in the served page.

---

## Core fields

| Field | Value |
| --- | --- |
| Project name | BasePulse |
| Website / domain to verify | `https://basepulse.botsniper.xyz` |
| Chain | Base mainnet (chain id 8453) |
| Contract address | `0xd2240b90486F63858ED823a2620cb6DC6FcB6019` |
| Contract verified | Yes — https://basescan.org/address/0xd2240b90486F63858ED823a2620cb6DC6FcB6019 |
| Category | Portfolio / analytics dashboard (read-only utility) |
| Contact email | hersonc00@proton.me |
| Base Builder Code | `bc_bo6g6vzn` (registered at dashboard.base.org) |

## Description

> BasePulse is a free, read-only utility dashboard for the Base ecosystem: token portfolio
> lookup, a gas-fee tracker with 7-day historical guidance, and an onchain reputation score
> with a breakdown of what drives it. Anyone can look up any Base address without
> connecting a wallet or creating an account. Connecting a wallet is optional and only
> needed to view your own portfolio or to record a snapshot.

## Risk profile — the part that matters for verification

State this plainly; it is the strongest argument in the submission and all of it is
verifiable from the published source:

- **The app never takes custody of funds.** The single deployed contract,
  `PortfolioSnapshot`, is an append-only ledger. Its own NatSpec says so: *"No funds are
  held; this is a pure write/append ledger."*
- **There is exactly one state-changing method**: `record(bytes32 fingerprint, bytes8
  builderCode)`. It is **not payable**, takes no value, and moves no tokens.
- **The app never requests a token approval.** No `approve`, no `permit`, no
  `setApprovalForAll` anywhere in the codebase — the most common trigger for malicious
  classification is entirely absent.
- **Only a hash goes onchain.** The recorded value is a keccak256 fingerprint of the
  holdings list. No balances, no amounts, no personal data.
- **The one transaction the UI offers is fully described before signing**, and the button
  copy matches the onchain effect exactly (Base's guidance calls this out specifically).
- **Wallet authentication is standard SIWE**, signature only, no transaction.
- **Standard connection methods offered**: Base Account SDK, injected/EIP-6963 wallets,
  Coinbase Wallet SDK, and WalletConnect — the exact set Base's guidance asks for.
- **No geo-blocking or regional restrictions.**

## Known weak signals — disclose them, don't hide them

Blockaid will see these anyway, and volunteering them reads better than being caught:

- The domain `botsniper.xyz` was registered **2026-04-15** (young), on a `.xyz` TLD, and
  BasePulse runs on a subdomain alongside unrelated personal projects. This is the main
  reason a "site not recognised" style warning would appear at all.
- Usage is near zero so far (the app has not been publicly announced yet), so there is no
  interaction volume to vouch for it.
- The GitHub repository is currently private, so the source cannot be independently read.
  **Making it public would materially strengthen this submission** — the history was
  already audited as clean (no `.env` ever committed, no keys, only public tx hashes).

## Supporting links

- Live app: https://basepulse.botsniper.xyz
- Verified contract: https://basescan.org/address/0xd2240b90486F63858ED823a2620cb6DC6FcB6019
- First recorded snapshot (real usage): https://basescan.org/tx/0x09cb992c3c9d45689a3915839cc8ddc4bdc4d03a033a86e2b9e3980fa2a92c60
- Farcaster: `@usebasepulse` — created, **nothing posted yet**; post something before
  submitting so the link isn't an empty profile.
- GitHub: `github.com/3dwrd/BasePulse` — private today; include only if made public.
