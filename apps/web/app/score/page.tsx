import ScoreRedirect from './score-redirect';

export const dynamic = 'force-dynamic';

export default function ScoreIndexPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Score</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Connect a wallet to view your onchain reputation, or visit{' '}
        <code className="text-sm">/score/&lt;address&gt;</code> directly.
      </p>
      <ScoreRedirect />
    </div>
  );
}
