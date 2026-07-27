#!/usr/bin/env bash
# Deploy PortfolioSnapshot to Base Sepolia (testnet).
# Run from anywhere:  bash /root/Proyectos/BasePulse/contracts/deploy-sepolia.sh
# Prompts for the keystore password (key stays encrypted on disk).
set -euo pipefail

export PATH="$PATH:$HOME/.foundry/bin"
cd /root/Proyectos/BasePulse/contracts

# Load public config (RPC urls, BASESCAN_API_KEY). No private key here.
set -a
. ./.env
set +a

DEPLOYER=$(cast wallet address --account basepulse-deployer)

echo ">> Deploying as $DEPLOYER to Base Sepolia (84532)..."
forge script script/DeployPortfolioSnapshot.s.sol:DeployPortfolioSnapshot \
  --rpc-url base_sepolia \
  --account basepulse-deployer \
  --sender "$DEPLOYER" \
  --broadcast \
  --verify
