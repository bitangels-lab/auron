import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";

type Detail = {
  id: string;
  name: string;
  apy: number;
  risk: string;
  liquidity: string;
  description: string;
  ltvBps: number;
};

export default async function MarketDetailPage({ params }: { params: { id: string } }) {
  const market = await apiGet<Detail>(`/markets/${params.id}`);
  if (!market) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <Link href="/markets" className="text-sm text-auron-mist hover:text-auron-foam">
          ← Markets
        </Link>
        <h1 className="mt-4 font-display text-4xl">{market.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-auron-mist">{market.description}</p>
      </div>

      <dl className="grid grid-cols-3 gap-4 border-y border-auron-line py-6 text-sm">
        <div>
          <dt className="text-auron-mist">APY</dt>
          <dd className="mt-1 font-mono text-lg text-auron-accent">{market.apy}%</dd>
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

      <Link
        href="/borrow"
        className="inline-block rounded bg-auron-accent px-5 py-2.5 text-sm font-medium text-auron-ink"
      >
        Deposit & borrow
      </Link>
    </div>
  );
}
