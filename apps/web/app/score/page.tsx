import { WalletSearchBar } from '@/components/wallet-search-bar';
import ScoreRedirect from './score-redirect';

export const dynamic = 'force-dynamic';

export default function ScoreIndexPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Score</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Connect a wallet above to view your own onchain reputation, or check any wallet
        below.
      </p>
      <WalletSearchBar />
      <ScoreRedirect />
    </div>
  );
}
