#!/usr/bin/env bash
# Deploy PortfolioSnapshot to Base MAINNET (real ETH, real gas).
# Run from anywhere:  bash /root/Proyectos/BasePulse/contracts/deploy-mainnet.sh
# Prompts for the keystore password (key stays encrypted on disk) AND for an
# explicit typed confirmation, per CLAUDE.md's "mainnet requires explicit
# human confirmation in terminal" rule. Testnet (Sepolia) must already be
# green — see docs/DEPLOY.md.
set -euo pipefail

export PATH="$PATH:$HOME/.foundry/bin"
cd /root/Proyectos/BasePulse/contracts

DEPLOYER=$(cast wallet address --account basepulse-deployer)
BALANCE=$(cast balance "$DEPLOYER" --rpc-url https://mainnet.base.org --ether)

echo "=================================================="
echo " MAINNET DEPLOY — Base (chain 8453)"
echo " Deployer: $DEPLOYER"
echo " Balance:  $BALANCE ETH (real funds, real gas)"
echo "=================================================="
read -r -p "Escribí DEPLOY (en mayúsculas) para confirmar, cualquier otra cosa cancela: " CONFIRM
if [ "$CONFIRM" != "DEPLOY" ]; then
  echo "Cancelado. No se envió nada."
  exit 1
fi

# Load public config (RPC urls, ETHERSCAN_API_KEY). No private key here.
set -a
. ./.env
set +a

echo ">> Deploying as $DEPLOYER to Base Mainnet (8453)..."
forge script script/DeployPortfolioSnapshot.s.sol:DeployPortfolioSnapshot \
  --rpc-url base_mainnet \
  --account basepulse-deployer \
  --sender "$DEPLOYER" \
  --broadcast \
  --verify
