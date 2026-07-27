#!/usr/bin/env bash
# Verifica que la contraseña del keystore cifrado es la correcta, sin firmar
# nada ni gastar gas: cast necesita descifrar el keystore para derivar la
# dirección pública, así que si la contraseña está bien, imprime la
# dirección; si está mal, falla con un error claro. La contraseña se escribe
# a mano en el prompt oculto de `cast` — este script nunca la recibe como
# argumento ni la guarda en ningún lado.
#
# Uso: correlo VOS con el prefijo `!` (necesita tu password interactivo):
#   ./verify_keystore_password.sh [nombre_de_cuenta]   (default: basepulse-deployer)
set -uo pipefail

export PATH="$PATH:$HOME/.foundry/bin"
ACCOUNT="${1:-basepulse-deployer}"
KEYSTORE="$HOME/.foundry/keystores/$ACCOUNT"

if [ ! -f "$KEYSTORE" ]; then
  echo "✗ No existe $KEYSTORE — todavía no creaste esa wallet." >&2
  exit 1
fi

echo "Meté la contraseña del keystore '$ACCOUNT' cuando te la pida:"
ADDR=$(cast wallet address --account "$ACCOUNT" 2>/tmp/verify_keystore_err)

if [ -n "$ADDR" ]; then
  echo "✓ Contraseña correcta. Dirección pública: $ADDR"
  echo "  (esta dirección es la que fondeás con unos centavos de ETH en Base para el deploy)"
else
  echo "✗ Contraseña incorrecta o keystore dañado:" >&2
  cat /tmp/verify_keystore_err >&2
  rm -f /tmp/verify_keystore_err
  exit 1
fi
rm -f /tmp/verify_keystore_err
