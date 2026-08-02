# Launch posts — ready to publish

Prepared 2026-08-02. Voice split follows the one-handle-per-brand pattern already in use:
**`@usebasepulse` speaks as the product**, the **personal X account speaks as the maker**.

Rules applied:
- Link is always the URL `basepulse.botsniper.xyz`, never a bare `@basepulse` — that handle
  isn't owned on X and a mention would resolve to a stranger or to nothing.
- No traction claims. The app has one recorded snapshot (the owner's) and no users. Every
  number below is real.
- Lead with the zero-friction action (look up any address, no signup). The onchain snapshot
  is the deep end and shouldn't headline.

**Prerequisite, already done 2026-08-02:** the OG share card was rendering "Invalid address"
for every valid address. Fixed in `9584648` — do not publish from an older deploy.

Post bodies below are inside code fences so they can be copied verbatim, with no quote
markers or stray indentation.

---

## 1. Farcaster — `@usebasepulse`, first post on the account

```
Paste any Base address, get its onchain score. No signup, no wallet connection.

BasePulse also tracks your portfolio and shows when gas is actually cheap — 7 days of history, not a live number you can't act on.

Free, and built solo.

basepulse.botsniper.xyz
```

Why this one first: Farcaster is the Base-native audience, and this account has existed
since 27-jul with zero posts. An empty profile is a worse signal than no profile, and both
the Blockaid and Base ecosystem submissions link to it.

## 2. X — personal account, maker voice

```
I built a free dashboard for Base.

Paste any address and you get its onchain score, its portfolio, and a gas tracker with 7 days of history so you know when fees are actually low — not just what they are right now.

No signup. No wallet needed to look someone up.

basepulse.botsniper.xyz
```

First person on purpose: on the personal account the interesting fact is that *you* built
it, not that a product exists.

## 3. Score card post — a few days later, either account

```
My own Base wallet scores 25/100.

Fair, honestly — barely any Base activity on it. The breakdown tells you exactly what's missing instead of just handing you a number.

Check yours: basepulse.botsniper.xyz
```

Attach or let the link unfurl the score card. Using the **real, low** score is the point:
it is more credible than a flattering one, it demonstrates the breakdown feature, and it
invites people to compare — which is the only genuinely viral mechanic the app has.

## 4. Builder post — highest-value one, personal account

```
Shipped a Base app with a Builder Code and found my transactions were all unattributed.

createConfig({ dataSuffix }) is silently ignored by @wagmi/core 3.4.12 — the key exists in no runtime path and no type there. Successful transactions, zero attribution.

Fix: pass dataSuffix per call. wagmi spreads unknown params into viem's writeContract → sendTransaction, which concats it.

68 bytes of calldata before, 97 after.
```

This is the post most likely to get real engagement from Base builders, because it is a
genuine finding that costs other people money to not know. It also feeds the GitHub/builder
reputation signal that Talent Protocol scores. Consider making the repo public first so the
claim is checkable.

## Order and timing

1. Post #1 and #2 the same day — the two submissions link to the Farcaster profile, so it
   should not be empty when a reviewer opens it.
2. Post #4 within a day or two while it's fresh. It's the credibility anchor.
3. Post #3 later, once there's anything to compare against.

After posting, paste the link into the platform's preview to confirm the card unfurls as the
real score card and not the old blank one.
