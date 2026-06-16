# DEPLOY — PortfolioSnapshot runbook (secure)

Per `CLAUDE.md` hard rules: **testnet first, always**; mainnet requires
**explicit human confirmation in terminal**; the private key lives ONLY in an
encrypted keystore / your password manager — **never in chat, code, env files, or CI.**

## 0. One-time: import the deployer key into an ENCRYPTED keystore

Run this **yourself, in your own terminal** (or with the `!` prefix in this
session). `--interactive` reads the key with hidden input — it is NOT echoed and
NOT stored in plaintext anywhere. You'll set a password that encrypts it on disk.

```bash
export PATH="$PATH:$HOME/.foundry/bin"
cast wallet import basepulse-deployer --interactive
# Prompts: paste private key (hidden) -> set a password
# Writes encrypted JSON to ~/.foundry/keystores/basepulse-deployer
```

Get the public address (safe to share / fund), prompts for the password:

```bash
cast wallet address --account basepulse-deployer
```

Record that address in `docs/builder-score-log.md`. Fund it:
- **Base Sepolia**: free faucet (e.g. https://www.alchemy.com/faucets/base-sepolia).
- **Base mainnet**: a few cents of ETH on Base (gas is sub-cent).

## 1. Config

```bash
cp contracts/.env.example contracts/.env
# fill BASESCAN_API_KEY (free from basescan.org). RPC defaults are fine.
set -a; . contracts/.env; set +a
```

## 2. Testnet deploy (Base Sepolia, chain 84532) — DO THIS FIRST

> **CRITICAL:** pass BOTH `--account` AND `--sender <your deployer address>`.
> With `--account` alone, forge simulates with its DEFAULT sender
> (`0x1804c8…`) and then REFUSES to broadcast ("You seem to be using Foundry's
> default sender") — the script prints a fake address but nothing hits the chain.
> Get your address from `cast wallet address --account basepulse-deployer`.

```bash
cd contracts
DEPLOYER=$(cast wallet address --account basepulse-deployer)   # prompts password
forge script script/DeployPortfolioSnapshot.s.sol:DeployPortfolioSnapshot \
  --rpc-url base_sepolia \
  --account basepulse-deployer \
  --sender "$DEPLOYER" \
  --broadcast --verify
# prompts for the keystore password again (key stays encrypted)
```

After it runs, CONFIRM it's real (must return non-empty bytecode):
`cast code <deployed_address> --rpc-url https://sepolia.base.org`

Record the deployed address in `apps/web/.env.local`:
`NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_SEPOLIA=0x...`
Confirm it's verified on https://sepolia.basescan.org.

## 3. Mainnet deploy (Base, chain 8453) — only after testnet is green

The script prints a `MAINNET DEPLOY` warning. Re-run with mainnet rpc:

```bash
cd contracts
DEPLOYER=$(cast wallet address --account basepulse-deployer)
forge script script/DeployPortfolioSnapshot.s.sol:DeployPortfolioSnapshot \
  --rpc-url base_mainnet \
  --account basepulse-deployer \
  --sender "$DEPLOYER" \
  --broadcast --verify
```

Record `NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_MAINNET=0x...` and confirm
verification on https://basescan.org. This is the onchain footprint that matters.

## Notes
- `--account basepulse-deployer` means the raw key never appears on the command
  line, in shell history, in env, or in this repo. The password decrypts it only
  in-memory for the single tx.
- If you ever see the key in plaintext anywhere, rotate it: deploy is idempotent
  enough that a fresh deployer is cheap.
