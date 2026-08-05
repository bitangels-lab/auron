import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";

type Detail = {
  id: string;
  name: string;
  token: string;
  role: string;
  apy: number;
  risk: string;
  liquidity: string;
  description: string;
  ltvBps: number;
  liquidationThresholdBps: number;
  borrowEnabled: boolean;
  valuation: string;
  assetYieldLabel?: string;
  borrowAprLabel?: string;
};

export default async function MarketDetailPage({ params }: { params: { id: string } }) {
  const market = await apiGet<Detail>(`/markets/${params.id}`);
  if (!market) notFound();

  const borrowHref = market.borrowEnabled
    ? `/borrow?market=${market.id}`
    : "/borrow?market=us-treasury";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <Link href="/markets" className="text-sm text-auron-mist hover:text-auron-foam">
          ← Markets
        </Link>
        <h1 className="mt-4 font-display text-4xl">{market.name}</h1>
        <p className="mt-2 text-sm text-auron-mist">
          {market.role} · {market.token}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-auron-mist">{market.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-y border-auron-line py-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-auron-mist">Asset yield</dt>
          <dd className="mt-1 font-mono text-lg text-auron-accent">{market.apy}%</dd>
          <p className="mt-1 text-xs text-auron-mist">{market.assetYieldLabel}</p>
        </div>
        <div>
          <dt className="text-auron-mist">Max LTV</dt>
          <dd className="mt-1 font-mono text-lg">{(market.ltvBps / 100).toFixed(0)}%</dd>
        </div>
        <div>
          <dt className="text-auron-mist">Liq. threshold</dt>
          <dd className="mt-1 font-mono text-lg">
            {(market.liquidationThresholdBps / 100).toFixed(0)}%
          </dd>
        </div>
        <div>
          <dt className="text-auron-mist">Valuation</dt>
          <dd className="mt-1 text-lg">{market.valuation}</dd>
        </div>
        <div>
          <dt className="text-auron-mist">Risk</dt>
          <dd className="mt-1 text-lg">{market.risk}</dd>
        </div>
        <div>
          <dt className="text-auron-mist">Liquidity</dt>
          <dd className="mt-1 text-lg">{market.liquidity}</dd>
        </div>
      </dl>

      {!market.borrowEnabled && (
        <p className="text-sm text-auron-warn">
          On-chain borrow in this POC uses the AURWA pool. This market is for product exploration;
          the CTA opens borrow with the live collateral path.
        </p>
      )}

      <p className="text-xs text-auron-mist">{market.borrowAprLabel}</p>

      <Link
        href={borrowHref}
        className="inline-block rounded bg-auron-accent px-5 py-2.5 text-sm font-medium text-auron-ink"
      >
        {market.borrowEnabled ? "Deposit & borrow" : "Open AURWA borrow flow"}
      </Link>
    </div>
  );
}
