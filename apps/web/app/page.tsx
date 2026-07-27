import { WalletSearchBar } from '@/components/wallet-search-bar';

export default function HomePage() {
  return (
    <div className="max-w-xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to BasePulse</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Portfolio tracking, gas optimization, and onchain reputation for the Base ecosystem.
          Connect your Base Account to get started.
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Check any wallet&apos;s Base score
        </h2>
        <WalletSearchBar />
      </div>
    </div>
  );
}
