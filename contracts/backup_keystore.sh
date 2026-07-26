#!/usr/bin/env bash
# Respaldo off-site del keystore cifrado del deployer (una sola vez, no es cron:
# el archivo casi no cambia). Manda el JSON cifrado (nunca la contraseña) al
# canal central de backups en Telegram (@PosNubeBot, mismo que usa POS Nube) y
# deja una copia local rotada fuera de git.
#
# Uso: ./backup_keystore.sh [nombre_de_cuenta]   (default: basepulse-deployer)
set -uo pipefail

ACCOUNT="${1:-basepulse-deployer}"
KEYSTORE="$HOME/.foundry/keystores/$ACCOUNT"
CREDS=/root/.telegram_posnube
LOCAL_DIR=/root/backups/basepulse
STAMP=$(date '+%Y-%m-%d %H:%M')

if [ ! -f "$KEYSTORE" ]; then
  echo "No existe $KEYSTORE — corré primero: cast wallet new ~/.foundry/keystores $ACCOUNT" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CREDS"
API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

mkdir -p "$LOCAL_DIR"
cp "$KEYSTORE" "$LOCAL_DIR/${ACCOUNT}_$(date +%Y%m%d_%H%M).json"

RESP=$(curl -s -m 20 -X POST "${API}/sendDocument" \
  -F chat_id="${TELEGRAM_CHAT_ID}" \
  -F document=@"${KEYSTORE}" \
  -F caption="🔐 BasePulse — respaldo keystore cifrado ($ACCOUNT) — $STAMP. Recordá: la contraseña va SOLO en tu gestor de contraseñas, nunca acá.")

if echo "$RESP" | grep -q '"ok":true'; then
  echo "✓ Respaldo enviado a Telegram y copia local en $LOCAL_DIR"
else
  echo "⚠️ Falló el envío a Telegram (queda igual la copia local en $LOCAL_DIR): $RESP" >&2
  exit 1
fi
