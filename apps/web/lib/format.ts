export function formatBalance(balance: string, decimals: number, maxFrac = 4): string {
  const big = BigInt(balance);
  const divisor = 10n ** BigInt(decimals);
  const whole = big / divisor;
  const frac = big % divisor;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, maxFrac).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}
